"""Unit tests for result validation service.

Tests the ResultValidator class that uses OpenAI to validate query results.
"""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from pg_mcp.config.settings import OpenAIConfig, ValidationConfig
from pg_mcp.models.errors import LLMError, LLMTimeoutError, LLMUnavailableError
from pg_mcp.models.query import ResultValidationResult
from pg_mcp.services.result_validator import ResultValidator


class TestResultValidatorInitialization:
    """Tests for ResultValidator initialization."""

    def test_initialization_with_defaults(self) -> None:
        """Test ResultValidator initialization with default configs."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig()

        validator = ResultValidator(openai_config, validation_config)

        assert validator.openai_config == openai_config
        assert validator.validation_config == validation_config
        assert validator.client is not None

    def test_initialization_with_custom_configs(self) -> None:
        """Test ResultValidator initialization with custom configs."""
        openai_config = OpenAIConfig(
            api_key="sk-custom123",
            model="gpt-4",
            timeout=60.0,
        )
        validation_config = ValidationConfig(
            enabled=True,
            confidence_threshold=80,
            timeout_seconds=45.0,
        )

        validator = ResultValidator(openai_config, validation_config)

        assert validator.openai_config.model == "gpt-4"
        assert validator.validation_config.confidence_threshold == 80


class TestResultValidatorValidationDisabled:
    """Tests for validation when disabled in config."""

    @pytest.mark.asyncio
    async def test_validation_disabled_returns_high_confidence(self) -> None:
        """Test that validation returns 100% confidence when disabled."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=False)
        validator = ResultValidator(openai_config, validation_config)

        result = await validator.validate(
            question="How many users?",
            sql="SELECT COUNT(*) FROM users",
            results=[{"count": 42}],
            row_count=1,
        )

        assert result.confidence == 100
        assert result.is_acceptable is True
        assert "disabled" in result.explanation.lower()
        assert result.suggestion is None


class TestResultValidatorSuccessfulValidation:
    """Tests for successful validation scenarios."""

    @pytest.mark.asyncio
    async def test_successful_validation_high_confidence(self) -> None:
        """Test successful validation with high confidence score."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=True, confidence_threshold=70)
        validator = ResultValidator(openai_config, validation_config)

        # Mock OpenAI response
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = json.dumps({
            "confidence": 95,
            "explanation": "Query correctly counts all users",
            "suggestion": None,
        })
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]

        with patch.object(
            validator.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            result = await validator.validate(
                question="How many users?",
                sql="SELECT COUNT(*) FROM users",
                results=[{"count": 42}],
                row_count=1,
            )

        assert result.confidence == 95
        assert result.is_acceptable is True
        assert "correctly counts" in result.explanation
        assert result.suggestion is None

    @pytest.mark.asyncio
    async def test_successful_validation_with_suggestion(self) -> None:
        """Test successful validation with improvement suggestion."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=True, confidence_threshold=70)
        validator = ResultValidator(openai_config, validation_config)

        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = json.dumps({
            "confidence": 75,
            "explanation": "Results match but query could be optimized",
            "suggestion": "Add index on created_at column",
        })
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]

        with patch.object(
            validator.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            result = await validator.validate(
                question="Recent users",
                sql="SELECT * FROM users WHERE created_at > NOW() - INTERVAL '7 days'",
                results=[{"id": 1}, {"id": 2}],
                row_count=2,
            )

        assert result.confidence == 75
        assert result.is_acceptable is True
        assert "could be optimized" in result.explanation
        assert result.suggestion == "Add index on created_at column"

    @pytest.mark.asyncio
    async def test_low_confidence_marked_unacceptable(self) -> None:
        """Test validation with low confidence below threshold."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=True, confidence_threshold=70)
        validator = ResultValidator(openai_config, validation_config)

        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = json.dumps({
            "confidence": 45,
            "explanation": "Query does not match the question intent",
            "suggestion": "Use WHERE clause to filter active users",
        })
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]

        with patch.object(
            validator.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            result = await validator.validate(
                question="How many active users?",
                sql="SELECT COUNT(*) FROM users",
                results=[{"count": 100}],
                row_count=1,
            )

        assert result.confidence == 45
        assert result.is_acceptable is False
        assert "does not match" in result.explanation
        assert result.suggestion is not None


class TestResultValidatorSampling:
    """Tests for result sampling behavior."""

    @pytest.mark.asyncio
    async def test_large_results_are_sampled(self) -> None:
        """Test that large result sets are sampled before validation."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=True, sample_rows=5)
        validator = ResultValidator(openai_config, validation_config)

        # Create large result set
        large_results = [{"id": i, "name": f"User {i}"} for i in range(100)]

        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = json.dumps({
            "confidence": 90,
            "explanation": "Results match the query",
            "suggestion": None,
        })
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]

        mock_create = AsyncMock(return_value=mock_response)
        with patch.object(validator.client.chat.completions, "create", mock_create):
            await validator.validate(
                question="List all users",
                sql="SELECT * FROM users",
                results=large_results,
                row_count=100,
            )

        # Verify that only sample_rows were sent in the prompt
        call_args = mock_create.call_args
        prompt = call_args.kwargs["messages"][1]["content"]
        # The prompt should contain references to only the first 5 results
        assert "User 0" in prompt or "User 1" in prompt
        # Should not contain later results
        assert "User 50" not in prompt


class TestResultValidatorErrorHandling:
    """Tests for error handling in validation."""

    @pytest.mark.asyncio
    async def test_empty_response_raises_error(self) -> None:
        """Test that empty OpenAI response raises LLMError."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=True)
        validator = ResultValidator(openai_config, validation_config)

        mock_response = MagicMock()
        mock_response.choices = []

        with patch.object(
            validator.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            with pytest.raises(LLMError, match="empty response"):
                await validator.validate(
                    question="Test",
                    sql="SELECT 1",
                    results=[{"value": 1}],
                    row_count=1,
                )

    @pytest.mark.asyncio
    async def test_empty_content_raises_error(self) -> None:
        """Test that empty message content raises LLMError."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=True)
        validator = ResultValidator(openai_config, validation_config)

        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = None
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]

        with patch.object(
            validator.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            with pytest.raises(LLMError, match="empty message content"):
                await validator.validate(
                    question="Test",
                    sql="SELECT 1",
                    results=[{"value": 1}],
                    row_count=1,
                )

    @pytest.mark.asyncio
    async def test_json_parse_error_returns_moderate_confidence(self) -> None:
        """Test that JSON parse errors return moderate confidence result."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=True)
        validator = ResultValidator(openai_config, validation_config)

        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = "Invalid JSON {not valid}"
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]

        with patch.object(
            validator.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            result = await validator.validate(
                question="Test",
                sql="SELECT 1",
                results=[{"value": 1}],
                row_count=1,
            )

        assert result.confidence == 60
        assert result.is_acceptable is False
        assert "parsing failed" in result.explanation.lower()

    @pytest.mark.asyncio
    async def test_timeout_raises_llm_timeout_error(self) -> None:
        """Test that timeout raises LLMTimeoutError."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=True, timeout_seconds=30.0)
        validator = ResultValidator(openai_config, validation_config)

        with patch.object(
            validator.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            side_effect=TimeoutError("Request timed out"),
        ):
            with pytest.raises(LLMTimeoutError, match="timed out after 30.0s"):
                await validator.validate(
                    question="Test",
                    sql="SELECT 1",
                    results=[{"value": 1}],
                    row_count=1,
                )

    @pytest.mark.asyncio
    async def test_authentication_error_raises_unavailable(self) -> None:
        """Test that authentication errors raise LLMUnavailableError."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=True)
        validator = ResultValidator(openai_config, validation_config)

        with patch.object(
            validator.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            side_effect=Exception("Authentication failed - invalid api_key"),
        ):
            with pytest.raises(LLMUnavailableError, match="authentication failed"):
                await validator.validate(
                    question="Test",
                    sql="SELECT 1",
                    results=[{"value": 1}],
                    row_count=1,
                )

    @pytest.mark.asyncio
    async def test_rate_limit_error_raises_unavailable(self) -> None:
        """Test that rate limit errors raise LLMUnavailableError."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=True)
        validator = ResultValidator(openai_config, validation_config)

        with patch.object(
            validator.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            side_effect=Exception("Rate_limit exceeded"),
        ):
            with pytest.raises(LLMUnavailableError, match="rate limit exceeded"):
                await validator.validate(
                    question="Test",
                    sql="SELECT 1",
                    results=[{"value": 1}],
                    row_count=1,
                )

    @pytest.mark.asyncio
    async def test_generic_error_raises_llm_error(self) -> None:
        """Test that generic errors raise LLMError."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=True)
        validator = ResultValidator(openai_config, validation_config)

        with patch.object(
            validator.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            side_effect=Exception("Some unexpected error"),
        ):
            with pytest.raises(LLMError, match="validation failed"):
                await validator.validate(
                    question="Test",
                    sql="SELECT 1",
                    results=[{"value": 1}],
                    row_count=1,
                )


class TestResultValidatorConfidenceBounds:
    """Tests for confidence score validation and bounds checking."""

    @pytest.mark.asyncio
    async def test_confidence_out_of_bounds_clamped(self) -> None:
        """Test that out-of-bounds confidence values are clamped."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=True, confidence_threshold=70)
        validator = ResultValidator(openai_config, validation_config)

        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = json.dumps({
            "confidence": 150,  # Out of bounds
            "explanation": "Test",
            "suggestion": None,
        })
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]

        with patch.object(
            validator.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            result = await validator.validate(
                question="Test",
                sql="SELECT 1",
                results=[{"value": 1}],
                row_count=1,
            )

        assert 0 <= result.confidence <= 100

    @pytest.mark.asyncio
    async def test_negative_confidence_clamped(self) -> None:
        """Test that negative confidence values are clamped to 0."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=True, confidence_threshold=70)
        validator = ResultValidator(openai_config, validation_config)

        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = json.dumps({
            "confidence": -10,  # Negative
            "explanation": "Test",
            "suggestion": None,
        })
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]

        with patch.object(
            validator.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            result = await validator.validate(
                question="Test",
                sql="SELECT 1",
                results=[{"value": 1}],
                row_count=1,
            )

        assert result.confidence >= 0

    @pytest.mark.asyncio
    async def test_invalid_confidence_type_defaults_to_50(self) -> None:
        """Test that invalid confidence type defaults to 50."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=True, confidence_threshold=70)
        validator = ResultValidator(openai_config, validation_config)

        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = json.dumps({
            "confidence": "not_a_number",  # Invalid type
            "explanation": "Test",
            "suggestion": None,
        })
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]

        with patch.object(
            validator.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            result = await validator.validate(
                question="Test",
                sql="SELECT 1",
                results=[{"value": 1}],
                row_count=1,
            )

        assert result.confidence == 50

    @pytest.mark.asyncio
    async def test_missing_confidence_defaults_to_50(self) -> None:
        """Test that missing confidence field defaults to 50."""
        openai_config = OpenAIConfig(api_key="sk-test123")
        validation_config = ValidationConfig(enabled=True, confidence_threshold=70)
        validator = ResultValidator(openai_config, validation_config)

        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = json.dumps({
            # No confidence field
            "explanation": "Test",
            "suggestion": None,
        })
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]

        with patch.object(
            validator.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            result = await validator.validate(
                question="Test",
                sql="SELECT 1",
                results=[{"value": 1}],
                row_count=1,
            )

        assert result.confidence == 50

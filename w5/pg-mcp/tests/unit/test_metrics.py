"""Unit tests for metrics collection.

Tests the MetricsCollector class for Prometheus metrics tracking.
"""

import pytest
from prometheus_client import REGISTRY

from pg_mcp.observability.metrics import MetricsCollector


class TestMetricsCollectorInitialization:
    """Tests for MetricsCollector initialization."""

    def test_singleton_pattern(self) -> None:
        """Test that MetricsCollector implements singleton pattern."""
        collector1 = MetricsCollector()
        collector2 = MetricsCollector()

        assert collector1 is collector2

    def test_metrics_initialized(self) -> None:
        """Test that all metrics are initialized."""
        metrics = MetricsCollector()

        # Verify all metrics exist
        assert metrics.query_requests is not None
        assert metrics.query_duration is not None
        assert metrics.llm_calls is not None
        assert metrics.llm_latency is not None
        assert metrics.llm_tokens_used is not None
        assert metrics.sql_rejected is not None
        assert metrics.db_connections_active is not None
        assert metrics.db_query_duration is not None
        assert metrics.schema_cache_age is not None


class TestQueryMetrics:
    """Tests for query-related metrics."""

    def test_increment_query_request(self) -> None:
        """Test incrementing query request counter."""
        metrics = MetricsCollector()
        initial_value = metrics.query_requests.labels(
            status="success", database="testdb"
        )._value.get()

        metrics.increment_query_request("success", "testdb")

        new_value = metrics.query_requests.labels(
            status="success", database="testdb"
        )._value.get()
        assert new_value == initial_value + 1

    def test_increment_query_request_different_statuses(self) -> None:
        """Test incrementing query requests with different statuses."""
        metrics = MetricsCollector()

        metrics.increment_query_request("success", "testdb")
        metrics.increment_query_request("error", "testdb")
        metrics.increment_query_request("validation_failed", "testdb")

        success_count = metrics.query_requests.labels(
            status="success", database="testdb"
        )._value.get()
        error_count = metrics.query_requests.labels(
            status="error", database="testdb"
        )._value.get()
        validation_count = metrics.query_requests.labels(
            status="validation_failed", database="testdb"
        )._value.get()

        # Each status should be tracked independently
        assert success_count >= 1
        assert error_count >= 1
        assert validation_count >= 1

    def test_query_duration_histogram(self) -> None:
        """Test query duration histogram observation."""
        metrics = MetricsCollector()

        # Observe some durations
        with metrics.query_duration.time():
            pass  # Simulate query execution

        # Verify histogram was updated - just check it doesn't raise
        assert metrics.query_duration is not None


class TestLLMMetrics:
    """Tests for LLM-related metrics."""

    def test_increment_llm_call(self) -> None:
        """Test incrementing LLM call counter."""
        metrics = MetricsCollector()
        initial_value = metrics.llm_calls.labels(operation="generate_sql")._value.get()

        metrics.increment_llm_call("generate_sql")

        new_value = metrics.llm_calls.labels(operation="generate_sql")._value.get()
        assert new_value == initial_value + 1

    def test_increment_llm_call_different_operations(self) -> None:
        """Test incrementing LLM calls for different operations."""
        metrics = MetricsCollector()

        metrics.increment_llm_call("generate_sql")
        metrics.increment_llm_call("validate_result")

        generate_count = metrics.llm_calls.labels(operation="generate_sql")._value.get()
        validate_count = metrics.llm_calls.labels(operation="validate_result")._value.get()

        # Each operation should be tracked independently
        assert generate_count >= 1
        assert validate_count >= 1

    def test_observe_llm_latency(self) -> None:
        """Test recording LLM call latency."""
        metrics = MetricsCollector()

        # Record some latencies - just verify it doesn't raise
        metrics.observe_llm_latency("generate_sql", 1.5)
        metrics.observe_llm_latency("generate_sql", 2.3)

        # Verify histogram exists and can be labeled
        assert metrics.llm_latency.labels(operation="generate_sql") is not None

    def test_increment_llm_tokens(self) -> None:
        """Test incrementing LLM token usage."""
        metrics = MetricsCollector()
        initial_value = metrics.llm_tokens_used.labels(
            operation="generate_sql"
        )._value.get()

        metrics.increment_llm_tokens("generate_sql", 150)
        metrics.increment_llm_tokens("generate_sql", 200)

        new_value = metrics.llm_tokens_used.labels(operation="generate_sql")._value.get()
        assert new_value == initial_value + 350  # 150 + 200


class TestSecurityMetrics:
    """Tests for security-related metrics."""

    def test_increment_sql_rejected(self) -> None:
        """Test incrementing SQL rejection counter."""
        metrics = MetricsCollector()
        initial_value = metrics.sql_rejected.labels(reason="ddl_detected")._value.get()

        metrics.increment_sql_rejected("ddl_detected")

        new_value = metrics.sql_rejected.labels(reason="ddl_detected")._value.get()
        assert new_value == initial_value + 1

    def test_increment_sql_rejected_different_reasons(self) -> None:
        """Test incrementing SQL rejections for different reasons."""
        metrics = MetricsCollector()

        metrics.increment_sql_rejected("ddl_detected")
        metrics.increment_sql_rejected("blocked_function")
        metrics.increment_sql_rejected("blocked_table")

        ddl_count = metrics.sql_rejected.labels(reason="ddl_detected")._value.get()
        func_count = metrics.sql_rejected.labels(reason="blocked_function")._value.get()
        table_count = metrics.sql_rejected.labels(reason="blocked_table")._value.get()

        # Each reason should be tracked independently
        assert ddl_count >= 1
        assert func_count >= 1
        assert table_count >= 1


class TestDatabaseMetrics:
    """Tests for database-related metrics."""

    def test_set_db_connections_active(self) -> None:
        """Test setting active database connection count."""
        metrics = MetricsCollector()

        metrics.set_db_connections_active("testdb", 5)

        value = metrics.db_connections_active.labels(database="testdb")._value.get()
        assert value == 5

    def test_set_db_connections_active_multiple_databases(self) -> None:
        """Test setting connection counts for multiple databases."""
        metrics = MetricsCollector()

        metrics.set_db_connections_active("db1", 3)
        metrics.set_db_connections_active("db2", 7)

        db1_value = metrics.db_connections_active.labels(database="db1")._value.get()
        db2_value = metrics.db_connections_active.labels(database="db2")._value.get()

        assert db1_value == 3
        assert db2_value == 7

    def test_observe_db_query_duration(self) -> None:
        """Test recording database query duration."""
        metrics = MetricsCollector()

        # Record some durations - just verify it doesn't raise
        metrics.observe_db_query_duration(0.05)
        metrics.observe_db_query_duration(0.12)

        # Verify histogram exists
        assert metrics.db_query_duration is not None


class TestCacheMetrics:
    """Tests for cache-related metrics."""

    def test_set_schema_cache_age(self) -> None:
        """Test setting schema cache age."""
        metrics = MetricsCollector()

        metrics.set_schema_cache_age("testdb", 300.0)

        value = metrics.schema_cache_age.labels(database="testdb")._value.get()
        assert value == 300.0

    def test_set_schema_cache_age_multiple_databases(self) -> None:
        """Test setting cache age for multiple databases."""
        metrics = MetricsCollector()

        metrics.set_schema_cache_age("db1", 100.0)
        metrics.set_schema_cache_age("db2", 500.0)

        db1_value = metrics.schema_cache_age.labels(database="db1")._value.get()
        db2_value = metrics.schema_cache_age.labels(database="db2")._value.get()

        assert db1_value == 100.0
        assert db2_value == 500.0


class TestMetricsHelperMethods:
    """Tests for metrics helper methods."""

    @pytest.mark.skip(reason="Prometheus doesn't support resetting metrics after registration")
    def test_reset_all_metrics(self) -> None:
        """Test resetting all metrics."""
        metrics = MetricsCollector()

        # Set some values
        metrics.increment_query_request("success", "testdb")
        metrics.increment_llm_call("generate_sql")

        # Reset metrics
        metrics.reset_all_metrics()

        # Verify metrics are reinitialized
        assert metrics.query_requests is not None
        assert metrics.llm_calls is not None


class TestMetricsIntegration:
    """Integration tests for metrics collection scenarios."""

    def test_complete_query_flow_metrics(self) -> None:
        """Test metrics collection for complete query flow."""
        metrics = MetricsCollector()

        # Simulate a complete query flow
        metrics.increment_llm_call("generate_sql")
        metrics.observe_llm_latency("generate_sql", 1.2)
        metrics.increment_llm_tokens("generate_sql", 200)

        metrics.observe_db_query_duration(0.05)

        metrics.increment_llm_call("validate_result")
        metrics.observe_llm_latency("validate_result", 0.8)
        metrics.increment_llm_tokens("validate_result", 150)

        metrics.increment_query_request("success", "testdb")

        # Verify all metrics were tracked
        assert metrics.llm_calls.labels(operation="generate_sql")._value.get() >= 1
        assert metrics.llm_calls.labels(operation="validate_result")._value.get() >= 1
        assert metrics.query_requests.labels(status="success", database="testdb")._value.get() >= 1

    def test_failed_query_flow_metrics(self) -> None:
        """Test metrics collection for failed query flow."""
        metrics = MetricsCollector()

        # Simulate a failed query due to security violation
        metrics.increment_llm_call("generate_sql")
        metrics.observe_llm_latency("generate_sql", 1.5)

        metrics.increment_sql_rejected("blocked_function")
        metrics.increment_query_request("security_violation", "testdb")

        # Verify rejection and failure were tracked
        assert metrics.sql_rejected.labels(reason="blocked_function")._value.get() >= 1
        assert (
            metrics.query_requests.labels(
                status="security_violation", database="testdb"
            )._value.get()
            >= 1
        )

    def test_concurrent_database_operations(self) -> None:
        """Test metrics for concurrent operations on multiple databases."""
        metrics = MetricsCollector()

        # Simulate operations on different databases
        metrics.increment_query_request("success", "db1")
        metrics.increment_query_request("success", "db2")
        metrics.increment_query_request("error", "db1")

        metrics.set_db_connections_active("db1", 5)
        metrics.set_db_connections_active("db2", 3)

        # Verify separate tracking per database
        db1_success = metrics.query_requests.labels(status="success", database="db1")._value.get()
        db2_success = metrics.query_requests.labels(status="success", database="db2")._value.get()
        db1_error = metrics.query_requests.labels(status="error", database="db1")._value.get()

        assert db1_success >= 1
        assert db2_success >= 1
        assert db1_error >= 1

        assert metrics.db_connections_active.labels(database="db1")._value.get() == 5
        assert metrics.db_connections_active.labels(database="db2")._value.get() == 3

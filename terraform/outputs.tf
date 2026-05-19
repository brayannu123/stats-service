output "api_endpoint" {
  description = "The HTTP API Gateway endpoint for stats-service"
  value       = aws_apigatewayv2_stage.dev.invoke_url
}

output "lambda_function_name" {
  description = "The name of the stats Lambda function"
  value       = aws_lambda_function.stats.function_name
}

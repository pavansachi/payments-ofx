#!/bin/bash

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_REGION=us-east-1
export AWS_ENDPOINT_URL=http://localhost:4566

# Override the AWS SDK endpoints by setting these env vars for CDK CLI
cdk bootstrap --context localstack=true aws://us-east-1/000000000000

# Deploy stack with environment override
cdk deploy --require-approval never --context localstack=true

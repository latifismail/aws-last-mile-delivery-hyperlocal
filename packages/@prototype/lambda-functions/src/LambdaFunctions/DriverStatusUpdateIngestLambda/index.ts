/*********************************************************************************************************************
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.                                               *
 *                                                                                                                   *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of                                  *
 *  this software and associated documentation files (the "Software"), to deal in                                    *
 *  the Software without restriction, including without limitation the rights to                                     *
 *  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of                                 *
 *  the Software, and to permit persons to whom the Software is furnished to do so.                                  *
 *                                                                                                                   *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR                                       *
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS                                 *
 *  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR                                   *
 *  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER                                   *
 *  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN                                          *
 *  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                                       *
 *********************************************************************************************************************/
import { Construct } from 'constructs'
import { Duration, aws_ec2 as ec2, aws_lambda as lambda, aws_events as events, aws_iam as iam, aws_opensearchservice as opensearchservice, aws_elasticache as elasticache } from 'aws-cdk-lib'
import { namespaced } from '@aws-play/cdk-core'
import { DeclaredLambdaFunction, ExposedDeclaredLambdaProps, DeclaredLambdaProps, DeclaredLambdaEnvironment, DeclaredLambdaDependencies } from '@aws-play/cdk-lambda'
import { AllowESWrite, LambdaInsightsExecutionPolicy } from '@prototype/lambda-common'
import { SERVICE_NAME } from '@prototype/common'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Environment extends DeclaredLambdaEnvironment {
	readonly DOMAIN_ENDPOINT: string
	readonly REDIS_HOST: string
	readonly REDIS_PORT: string
	readonly EVENT_BUS_NAME: string
	readonly SERVICE_NAME: string
}

interface Dependencies extends DeclaredLambdaDependencies {
	readonly vpc: ec2.IVpc
	readonly lambdaSecurityGroups: ec2.ISecurityGroup[]
	readonly redisCluster: elasticache.CfnCacheCluster
	readonly lambdaLayers: lambda.ILayerVersion[]
	readonly eventBus: events.EventBus
	readonly openSearchDomain: opensearchservice.IDomain
}

type TDeclaredProps = DeclaredLambdaProps<Environment, Dependencies>

export class DriverStatusUpdateLambda extends DeclaredLambdaFunction<Environment, Dependencies> {
	constructor (scope: Construct, id: string, props: ExposedDeclaredLambdaProps<Dependencies>) {
		const {
			vpc,
			lambdaSecurityGroups,
			redisCluster,
			lambdaLayers,
			eventBus,
			openSearchDomain,
		} = props.dependencies

		const declaredProps: TDeclaredProps = {
			functionName: namespaced(scope, 'DriverStatusUpdate'),
			description: 'Driver Status Update function',
			code: lambda.Code.fromAsset(DeclaredLambdaFunction.getLambdaDistPath(__dirname, '@lambda/driver-status-update.zip')),
			dependencies: props.dependencies,
			timeout: Duration.seconds(30),
			environment: {
				REDIS_HOST: redisCluster.attrRedisEndpointAddress,
				REDIS_PORT: redisCluster.attrRedisEndpointPort,
				EVENT_BUS_NAME: eventBus.eventBusName,
				SERVICE_NAME: SERVICE_NAME.DRIVER_SERVICE,
				DOMAIN_ENDPOINT: openSearchDomain.domainEndpoint,
			},
			initialPolicy: [
				new iam.PolicyStatement({
					actions: [
						'events:PutEvents',
					],
					effect: iam.Effect.ALLOW,
					resources: [eventBus.eventBusArn],
				}),
				AllowESWrite(openSearchDomain.domainArn),
			],
			layers: lambdaLayers,
			vpc,
			vpcSubnets: {
				subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
			},
			securityGroups: lambdaSecurityGroups,
		}

		super(scope, id, declaredProps)

		if (this.role) {
			this.role.addManagedPolicy(LambdaInsightsExecutionPolicy())
		}
	}
}
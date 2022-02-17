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
module.exports = {
	destinationTable: process.env.DESTINATION_TABLE_NAME,
	destinationSimulationTable: process.env.DESTINATION_SIMULATION_TABLE_NAME,
	region: process.env.AWS_REGION,
	clusterName: process.env.CLUSTER_NAME,
	taskDefinitionName: (process.env.TASK_DEFINITION_NAME || '').split('/').pop(),
	subnets: (process.env.SUBNETS || '').split(','),
	securityGroup: process.env.SECURITY_GROUP,
	containerName: process.env.CONTAINER_NAME,
	simulatorApi: process.env.SIMULATOR_API,
	simulatorConfigBucket: process.env.SIMULATOR_CONFIG_BUCKET,
}

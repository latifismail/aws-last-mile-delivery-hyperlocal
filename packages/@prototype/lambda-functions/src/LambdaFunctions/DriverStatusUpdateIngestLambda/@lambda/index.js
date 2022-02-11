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
/* eslint-disable no-console */
const aws = require('aws-sdk')
const { promisify } = require('util')
const { getRedisClient } = require('/opt/redis-client')
const { getESClient } = require('/opt/es-client')
const { REDIS_HASH, ES } = require('/opt/lambda-utils')

const { DRIVER_STATUS, DRIVER_STATUS_UPDATED_AT } = REDIS_HASH

const client = getRedisClient()
const esClient = getESClient(`https://${process.env.DOMAIN_ENDPOINT}`)
const eventBridge = new aws.EventBridge()

client.hget = promisify(client.hget)
client.hset = promisify(client.hset)

const handler = async (event, context) => {
	console.debug(`Event payload: ${JSON.stringify(event, null, 2)}`) // TODO: remove this for PROD

	if (event.type !== 'STATUS_CHANGE') {
		console.error(`Record from IoT Core is not valid. The type is not 'STATUS_CHANGE', skipping. Data received: ${JSON.stringify(event)}`)

		return
	}

	if (!recordValid(event)) {
		console.error(`Record from IoT Core is not valid. Skipping. Data received: ${JSON.stringify(event)}`)

		return
	}

	const { driverId, status, timestamp } = event

	try {
		// update status in REDIS
		await client.hset(DRIVER_STATUS, driverId, status)
		await client.hset(DRIVER_STATUS_UPDATED_AT, driverId, timestamp)
		console.debug(`STATUS_CHANGE :: ${event.driverId} :: Successfully updated Redis`)
	} catch (err) {
		console.error(`Error updating Redis :: ${event.type} :: ${JSON.stringify(err)}`)
	}

	try {
		await esClient.update({
			id: driverId,
			index: ES.DRIVER_LOCATION_INDEX,
			body: {
				doc: {
					status,
					timestamp,
				},
			},
		})
		console.debug(`STATUS_CHANGE :: ${event.driverId} :: Successfully updated ES`)
	} catch (err) {
		console.error(`Error updating Elasticache :: ${event.type} :: ${JSON.stringify(err)}`)
	}

	try {
		await eventBridge.putEvents({
			Entries: [{
				EventBusName: process.env.EVENT_BUS_NAME,
				Source: process.env.SERVICE_NAME,
				DetailType: 'DRIVER_STATUS_CHANGE',
				Detail: JSON.stringify(event),
			}],
		}).promise()

		console.debug(`STATUS_CHANGE :: ${event.driverId} :: Successfully sent to Event Bridge`)
	} catch (err) {
		console.error(`Error sending message to Event Bridge :: ${event.type} :: ${JSON.stringify(err)}`)
	}
}

const recordValid = (record) => {
	return !(record.driverId == null || record.status == null || record.timestamp == null)
}
exports.handler = handler

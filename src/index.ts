import { createServer } from 'http'
import { createLogger } from 'bunyan'
import { ServerLogger } from '@offirmo/loggers-types-and-stubs'
import { MongoClient, Db as MongoDb } from 'mongodb'

import { factory as expressAppFactory } from './express-app'


async function factory() {
	console.log('Starting_')

	// TODO plug to a syslog
	const logger: ServerLogger = createLogger({
		name: 'ServerX',
		level: 'debug',
	})
	logger.info('Logger ready.')


	process.on('uncaughtException', (err: Error) => {
		console.error(`Uncaught exception!`, err)
		setTimeout(() => process.exit(1), 250)
		logger.fatal(err, `Uncaught exception!`)
		// TODO cleanup
		// I've an experimental module for that…
	})

	process.on('unhandledRejection', (reason: any, p: Promise<any>): void => {
		console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
		setTimeout(() => process.exit(1), 250)
		logger.fatal({ reason, p }, `Uncaught rejection!`)
		// TODO cleanup
		// I've an experimental module for that…
	})

	process.on('warning', (warning: Error) => {
		console.warn(warning)
		logger.warn(warning)
	})

	logger.debug('Now listening to uncaughts and warnings.')


	const config = {
		port: process.env.PORT || 5000,
		isHttps: (process.env.IS_HTTPS === 'true'),
		sessionSecret: process.env.SESSION_SECRET,
		dbUrlMongo01: process.env.DB_URL_MONGO_01,
		dbUrlRedis01: process.env.DB_URL_REDIS_01,
	}
	if (!config.dbUrlMongo01) {
		logger.fatal('Missing config DB_URL_MONGO_01')
		throw new Error('Missing or invalid configuration (env var): DB_URL_MONGO_01')
	}
	if (!config.dbUrlRedis01) {
		logger.fatal('Missing config DB_URL_REDIS_01')
		throw new Error('Missing or invalid configuration (env var): DB_URL_REDIS_01')
	}

	const dbMongo01: MongoDb = await new Promise<MongoDb>((resolve, reject) => {
		MongoClient.connect(config.dbUrlMongo01!, function(err, client) {
			if (err) {
				reject(err)
				return
			}

			console.log("Connected successfully to server")
		   
			const dbName = 'TODO'
			resolve(client.db(dbName))
		  })
	})

	

	const server = createServer(await expressAppFactory({
		logger,
		isHttps: config.isHttps,
		sessionSecret: config.sessionSecret,
		dbUsers: dbMongo01,
		dbSessionRedisUrl: config.dbUrlRedis01,
	}))

	server.on('error', (err: Error) => {
		console.error('something bad happened', err)
		logger.fatal(err, `Server error!`)
	})
	
	server.listen(config.port, () => {
		logger.info(`Server launched, listening on :${config.port}`)
	})
}

factory()
.catch(e => {
	console.error('Server failed to launch:', e.message)
})

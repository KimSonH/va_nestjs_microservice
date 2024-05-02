import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { Partitioners } from 'kafkajs'
import { APP_CONSTANT } from 'src/helper/constant'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: APP_CONSTANT.VA_KAFKA,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: APP_CONSTANT.VA_CLIENT,
            brokers: process.env.KAFKA_BROKER.split(',')
          },
          consumer: {
            groupId: APP_CONSTANT.VA_CONSUMER
          },
          subscribe: { fromBeginning: false },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner
          }
        }
      }
    ])
  ],
  exports: [ClientsModule]
})
export class KafkaModule {}

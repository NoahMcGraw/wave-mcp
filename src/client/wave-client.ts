import { GraphQLClient } from 'graphql-request';
import type { WaveConfig } from '../types/index.js';

export class WaveClient {
  private client: GraphQLClient;
  private config: WaveConfig;

  constructor(config: WaveConfig) {
    this.config = config;
    this.client = new GraphQLClient('https://gql.waveapps.com/graphql/public', {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async query<T = any>(query: string, variables?: any): Promise<T> {
    try {
      return await this.client.request<T>(query, variables);
    } catch (error: any) {
      throw new Error(`Wave API Error: ${error.message}`);
    }
  }

  async mutate<T = any>(mutation: string, variables?: any): Promise<T> {
    try {
      return await this.client.request<T>(mutation, variables);
    } catch (error: any) {
      throw new Error(`Wave API Error: ${error.message}`);
    }
  }

  getBusinessId(): string {
    if (!this.config.businessId) {
      throw new Error('Business ID is required but not configured');
    }
    return this.config.businessId;
  }

  setBusinessId(businessId: string) {
    this.config.businessId = businessId;
  }
}

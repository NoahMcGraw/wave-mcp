/**
 * Wave GraphQL API Client
 */

import { GraphQLClient } from 'graphql-request';
import type { WaveConfig, WaveError } from './types/index.js';

const WAVE_API_URL = 'https://gql.waveapps.com/graphql/public';

export class WaveClient {
  private client: GraphQLClient;
  private config: WaveConfig;

  constructor(config: WaveConfig) {
    this.config = config;
    this.client = new GraphQLClient(WAVE_API_URL, {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async query<T = any>(query: string, variables?: any): Promise<T> {
    try {
      const data = await this.client.request<T>(query, variables);
      return data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async mutate<T = any>(mutation: string, variables?: any): Promise<T> {
    try {
      const data = await this.client.request<T>(mutation, variables);
      return data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): WaveError {
    const waveError = new Error(error.message || 'Wave API Error') as WaveError;
    
    if (error.response?.errors) {
      waveError.graphQLErrors = error.response.errors;
      waveError.message = error.response.errors.map((e: any) => e.message).join(', ');
    }
    
    if (error.response?.status) {
      waveError.statusCode = error.response.status;
    }
    
    if (error.request && !error.response) {
      waveError.networkError = new Error('Network request failed');
    }
    
    return waveError;
  }

  getBusinessId(): string | undefined {
    return this.config.businessId;
  }

  setBusinessId(businessId: string): void {
    this.config.businessId = businessId;
  }
}

export function createWaveClient(config: WaveConfig): WaveClient {
  return new WaveClient(config);
}

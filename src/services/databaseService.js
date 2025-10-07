/**
 * Database Service - MongoDB Atlas Configuration
 * This service provides database-related configuration and utilities for the frontend
 */

class DatabaseService {
  constructor() {
    this.dbType = process.env.REACT_APP_DB_TYPE || 'ATLAS';
    this.dbName = process.env.REACT_APP_DB_NAME || 'local-treasures';
  }

  /**
   * Get database configuration info
   */
  getConfig() {
    return {
      type: this.dbType,
      name: this.dbName,
      isAtlas: this.dbType === 'ATLAS',
      isLocal: false // Always false - local MongoDB not supported
    };
  }

  /**
   * Check if the application is properly configured for MongoDB Atlas
   */
  isConfigured() {
    const config = this.getConfig();
    return config.isAtlas && config.name;
  }

  /**
   * Get database status for display purposes
   */
  getStatus() {
    const config = this.getConfig();
    
    if (!this.isConfigured()) {
      return {
        status: 'error',
        message: 'Database not properly configured',
        details: 'MongoDB Atlas configuration required'
      };
    }

    return {
      status: 'configured',
      message: 'Connected to MongoDB Atlas',
      details: `Database: ${config.name}`,
      type: config.type
    };
  }

  /**
   * Get connection info for debugging (safe for frontend)
   */
  getConnectionInfo() {
    return {
      provider: 'MongoDB Atlas',
      database: this.dbName,
      local: false,
      cloud: true,
      supportedFeatures: [
        'Geospatial Queries',
        'Full-Text Search',
        'Aggregation Pipeline',
        'Atlas Search',
        'Real-time Analytics'
      ]
    };
  }
}

// Export singleton instance
const databaseService = new DatabaseService();
export default databaseService;
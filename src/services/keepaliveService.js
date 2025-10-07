import api from './api';

class KeepAliveService {
  constructor() {
    this.intervalId = null;
    this.isActive = false;
  }

  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // Send keepalive request every 5 minutes
    this.intervalId = setInterval(async () => {
      try {
        await api.get('/keepalive');
      } catch (error) {
        // Keepalive failed, but continue trying
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Manual keepalive
  async ping() {
    try {
      const response = await api.get('/keepalive');
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const keepAliveService = new KeepAliveService();
export default keepAliveService;

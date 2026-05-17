/**
 * Notification Service Utility
 * 
 * Temporary mock notification service untuk MVP/Demo
 * Nanti akan diintegrasikan dengan Kelompok 5 (Communication & Notification)
 * 
 * Ini mengirim event ke external notification service saat:
 * - Bid status berubah
 * - Deal finalized
 * - Counter-offer dikirim
 */

const notificationService = {
  /**
   * Send bid status update notification
   * @param {string} userId - User yang akan menerima notifikasi (kelompok_id)
   * @param {string} status - Status bid baru (Accepted/Rejected)
   * @param {string} projectTitle - Judul proyek
   */
  async sendBidStatusUpdate(userId, status, projectTitle) {
    try {
      // TODO: Integrate dengan Kelompok 5 API saat siap
      // POST /api/notifications/send
      
      console.log(`[NOTIFICATION] Bid Status Update: ${userId} - ${status} - ${projectTitle}`);
      
      // Mock implementation - just log untuk sekarang
      return {
        success: true,
        message: `Bid notification sent to ${userId}`
      };
      
    } catch (error) {
      // Don't fail main operation if notification fails
      console.warn('Notification service unavailable:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send deal confirmation notification
   * @param {string} userId - User yang akan menerima notifikasi
   * @param {string} projectTitle - Judul proyek
   */
  async sendDealConfirmed(userId, projectTitle) {
    try {
      console.log(`[NOTIFICATION] Deal Confirmed: ${userId} - ${projectTitle}`);
      
      return {
        success: true,
        message: `Deal confirmation sent to ${userId}`
      };
      
    } catch (error) {
      console.warn('Notification service unavailable:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send counter-offer notification
   * @param {string} userId - User yang akan menerima notifikasi
   * @param {string} projectTitle - Judul proyek
   * @param {object} counterOffer - Detail counter offer
   */
  async sendCounterOfferNotification(userId, projectTitle, counterOffer) {
    try {
      console.log(`[NOTIFICATION] Counter Offer: ${userId} - ${projectTitle}`, counterOffer);
      
      return {
        success: true,
        message: `Counter-offer notification sent to ${userId}`
      };
      
    } catch (error) {
      console.warn('Notification service unavailable:', error.message);
      return { success: false, error: error.message };
    }
  }
};

module.exports = notificationService;

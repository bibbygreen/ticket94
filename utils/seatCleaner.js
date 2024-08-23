const SeatModel = require("../models/seatModel");

// 設定清理過期座位的時間間隔（例如每 1 分鐘執行一次）
const CLEAN_INTERVAL = 60 * 1000; // 1 分鐘（以毫秒為單位）

const cleanExpiredSeats = async () => {
  try {
    console.log("Checking for expired seats...");

    // 先檢查是否有過期的 temporary_hold 狀態的座位
    const expiredSeats = await SeatModel.getExpiredSeats();

    if (expiredSeats.length > 0) {
      console.log(`Found ${expiredSeats.length} expired seats, cleaning up...`);

      // 如果找到過期的座位，則根據 member_id 檢查並釋放所有過期的 temporary_hold 狀態的座位
      await SeatModel.releaseSeatsByMember();

      console.log("Seat cleaner job completed.");
    } else {
      console.log("No expired seats found.");
    }
  } catch (error) {
    console.error("Error in seat cleaner job:", error);
  }
};

// 使用 setInterval 設定定期清理的任務
setInterval(cleanExpiredSeats, CLEAN_INTERVAL);

// 初始化時立即執行一次
cleanExpiredSeats();

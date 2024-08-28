const SeatModel = require("../models/seatModel");

const CLEAN_INTERVAL = 60 * 1000; // 1 分鐘（以毫秒為單位）

const cleanExpiredSeats = async () => {
  try {
    console.log("Checking for expired seats...");

    // 清理過期的 temporary_hold 狀態的座位
    const expiredTempHoldSeats = await SeatModel.releaseTempSeatsByMember();
    if (expiredTempHoldSeats > 0) {
      console.log(
        `Released ${expiredTempHoldSeats} expired temporary hold seats.`
      );
    } else {
      console.log("No expired temporary hold seats found.");
    }

    // 清理過期的 intermediate 狀態的座位
    const expiredIbonSeats = await SeatModel.releaseIbonSeatsByMember();
    if (expiredIbonSeats > 0) {
      console.log(
        `Released ${expiredIbonSeats} expired intermediate hold seats.`
      );
    } else {
      console.log("No expired intermediate hold seats found.");
    }

    console.log("Seat cleaner job completed.");
  } catch (error) {
    console.error("Error in seat cleaner job:", error);
  }
};

// 使用 setInterval 設定定期清理的任務
setInterval(cleanExpiredSeats, CLEAN_INTERVAL);

// 初始化時立即執行一次
cleanExpiredSeats();

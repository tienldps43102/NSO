import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc)
dayjs.extend(timezone)

export const TZ_VN = "Asia/Ho_Chi_Minh"

export const nowVN = () => dayjs().tz(TZ_VN)
export const todayVN = () => nowVN().format("YYYY-MM-DD")

export default dayjs

import { AppError } from '../../common/errors.js';
export function rejectInteractiveWrite(): never {
  throw new AppError('INTERACTIVE_CONTENT_READ_ONLY','Hoạt động do hệ thống chuẩn bị sẵn. Cô có thể xem thử và xem số liệu.',403);
}

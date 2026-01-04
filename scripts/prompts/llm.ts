import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { z } from 'zod';

const provider = createOpenAICompatible({
  name: 'megallm',
  apiKey: process.env.MEGA_LLM_API,
  baseURL: 'https://ai.megallm.io/v1',
  includeUsage: false, // Include usage information in streaming responses
});
export const genPrompt = (prompt: string) => {
 return `
 Bạn là bộ trích xuất dữ liệu sản phẩm sách/manga từ tiêu đề (product title) tiếng Việt.

NHIỆM VỤ
- Input: 1 chuỗi tiêu đề sản phẩm (title).
- Output: 1 JSON hợp lệ (chỉ JSON, không kèm giải thích).

ĐỊNH NGHĨA FIELD
1) series_title:
- Là tên tác phẩm/series.
- Có thể chứa dấu " - " nếu đó là một phần của tên (ví dụ: "Nisekoi - Cặp Đôi Giả Tạo").
- Loại bỏ tiền tố phân loại trong ngoặc vuông như: [Manga], [Light Novel]... khỏi series_title.

2) volume (optional):
- Số tập dạng "Tập <số>" trong title.
- Trả về số nguyên. Nếu không tìm thấy, trả null.

3) variant (optional):
- Là "biến thể bán hàng": gồm toàn bộ thông tin còn lại ngoài (series_title, volume).
- Bao gồm (nếu có): Bản/Edition (ví dụ "Bản Đặc Biệt", "New Edition"), Ver (ví dụ "Dark Ver", "Bright Ver"), phụ đề/arc đứng sau tập, và các phần "Tặng Kèm ...".
- Nếu không có bất kỳ thông tin biến thể nào, đặt variant = "Standard".
- Variant nên là chuỗi gọn, dễ đọc, giữ ý nghĩa (có thể bỏ bớt từ thừa nhưng không được bịa).



QUY TẮC QUAN TRỌNG
- Chỉ dùng thông tin có trong title, KHÔNG suy đoán.
- Không tự thêm quà tặng/edition nếu title không có.
- Output phải là JSON hợp lệ, không markdown, không text ngoài JSON.

FEW-SHOT EXAMPLES

Input: "Nữ Binh Thần Tốc - Tập 7"
Output:
{"series_title":"Nữ Binh Thần Tốc","volume":7,"variant":"Standard"}

Input: "Kagurabachi - Tập 1 - Bản Đặc Biệt - Tặng Kèm Postcard"
Output:
{"series_title":"Kagurabachi","volume":1,"variant":"Bản Đặc Biệt - Tặng Kèm Postcard"}

Input: "MONSTER #8 - Tập 13 - Bản Đặc Biệt - Dark Ver - Tặng Kèm 1 Bìa Thiết Kế Riêng + 2 Standee Bập Bênh"
Output:
{"series_title":"MONSTER #8","volume":13,"variant":"Bản Đặc Biệt - Dark Ver - Tặng Kèm 1 Bìa Thiết Kế Riêng + 2 Standee Bập Bênh"}

Input: "[Manga] Văn Hào Lưu Lạc - Gâu! - Tập 4 - Bản Đặc Biệt - Tặng Kèm Sticker"
Output:
{"series_title":"Văn Hào Lưu Lạc - Gâu!","volume":4,"variant":"Bản Đặc Biệt - Tặng Kèm Sticker"}

Input: "Nisekoi - Cặp Đôi Giả Tạo - Tặng Kèm Postcard"
Output:
{"series_title":"Nisekoi - Cặp Đôi Giả Tạo", "variant":"Tặng Kèm Postcard"}

Bây giờ hãy xử lý input sau và trả về đúng JSON theo format đã định nghĩa.
Input: ${prompt}
`
}
export const outputSchema = z.object({
  series_title: z.string(),
  volume: z.number().optional(),
  variant: z.string().optional(),
});
export const model = provider('qwen/qwen3-next-80b-a3b-instruct');
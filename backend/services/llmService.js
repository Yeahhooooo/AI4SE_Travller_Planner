// Node.js v18+ has fetch built-in globally, so no import is needed.

// 在这里替换成你选择的语言模型的 API 地址
const LLM_API_URL = 'https://qianfan.baidubce.com/v2/chat/completions'; 
// 在这里替换成你的 API 密钥
const API_KEY = 'bce-v3/ALTAK-m4diFz1se7ge4TOuIrbU5/6eb7acaf3c682582e95f100ad97c67eaa44c476e';

const MODEL = "ernie-4.5-turbo-vl-32k";

/**
 * 构建一个用于生成旅行计划的详细 Prompt
 * @param {string} userInput - 用户的原始输入
 * @returns {string} - 发送给 LLM 的完整 Prompt
 */
const buildPrompt = (userInput) => {
    // 这是整个 Prompt 工程的核心部分。
    // 我们通过详细的指令和 JSON 结构示例，引导模型输出我们需要的格式。
    return `You are an expert travel planner AI. Your task is to generate a detailed travel itinerary based on the user's request.
The output MUST be a single, valid JSON object and nothing else. Do not include any text before or after the JSON object.
All descriptive text fields (trip_name, description) MUST be in Chinese.

User's request: "${userInput}"

The JSON object must follow this exact structure:
{
  "trip_name": "一个描述性强且吸引人的中文行程名称",
  "start_date": "YYYY-MM-DD format",
  "end_date": "YYYY-MM-DD format",
  "budget": "一个代表预估总预算的数字",
  "events": [
    {
      "type": "One of 'transport', 'dining', 'activity', 'accommodation'",
      "description": "一个详细的中文事件描述",
      "location": "一个用于地图编码的、尽可能详细的地址(例如, '日本东京都新宿区新宿御苑')",
      "latitude": "此地点的精确纬度 (数字)",
      "longitude": "此地点的精确经度 (数字)",
      "start_time": "ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)",
      "end_time": "ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)",
      "expenses": [
        {
          "amount": "一个代表此项具体花费预估成本的数字",
          "category": "One of 'transport', 'food', 'tickets', 'shopping', 'other'",
          "description": "一个简短的中文费用描述 (例如, '地铁票')",
          "expense_date": "YYYY-MM-DD format"
        }
      ]
    }
  ]
}

Important Rules:
1. All fields in the JSON structure are mandatory. All text values like trip_name and description must be in Chinese.
2. If an event has no specific expense, provide an empty array for the "expenses" field: [].
3. Ensure all dates and times are in the correct specified format.
4. The response must be only the JSON object.
5. The "location" field should be as specific as possible to ensure accurate map geocoding, including country, city, district, and具体地点.
6. Every event MUST include both accurate latitude and longitude fields for precise location mapping.
`;
};

/**
 * 调用大语言模型 API 来生成旅行计划
 * @param {string} prompt - 用户的原始输入
 * @returns {Promise<object>} - 解析后的 JSON 对象，代表旅行计划
 */
const callLLMApi = async (userInput) => {
    const fullPrompt = buildPrompt(userInput);

    try {
        const response = await fetch(LLM_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}` // 根据你的 API 要求调整认证方式
            },
            body: JSON.stringify({
                // 这里的 body 结构需要根据你使用的具体 LLM API 文档进行调整
                // 例如, OpenAI 的格式可能是：
                // model: "gpt-4-turbo-preview",
                // messages: [{ role: "user", content: fullPrompt }],
                // response_format: { type: "json_object" }
                model: MODEL,
                messages: [{ role: "user", content: fullPrompt }]
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`LLM API request failed with status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();

        // 根据 LLM API 的返回格式，提取出核心的 JSON 内容
        // 例如，内容可能在 data.choices[0].message.content 中
        const content = data.choices[0].message.content; 

        console.log('LLM API raw response content:', content);

        // 解析模型返回的 JSON 字符串

        // 测试时为了方便，直接返回一个模拟的 JSON 对象
//         const content = `{
//   "trip_name": "北京历史文化两日深度游",
//   "start_date": "2023-11-01",
//   "end_date": "2023-11-02",
//   "budget": "5000",
//   "events": [
//     {
//       "id": 1,
//       "type": "accommodation",
//       "description": "入住北京市中心酒店，方便游览主要景点",
//       "location": "中国北京市东城区王府井大街88号王府井大酒店",
//       "latitude": 39.9134,
//       "longitude": 116.4152,
//       "start_time": "2023-11-01T14:00:00+08:00",
//       "end_time": "2023-11-02T12:00:00+08:00",
//       "expenses": [
//         {
//           "id": 1,
//           "amount": "800",
//           "category": "other",
//           "description": "酒店住宿费用",
//           "expense_date": "2023-11-01"
//         }
//       ]
//     },
//     {
//       "id": 2,
//       "type": "activity",
//       "description": "参观故宫博物院，感受明清皇家历史",
//       "location": "中国北京市东城区景山前街4号故宫博物院",
//       "latitude": 39.9163,
//       "longitude": 116.3971,
//       "start_time": "2023-11-01T15:30:00+08:00",
//       "end_time": "2023-11-01T18:00:00+08:00",
//       "expenses": [
//         {
//           "id": 2,
//           "amount": "60",
//           "category": "tickets",
//           "description": "故宫门票",
//           "expense_date": "2023-11-01"
//         }
//       ]
//     },
//     {
//       "id": 3,
//       "type": "dining",
//       "description": "在王府井老字号餐厅品尝北京烤鸭",
//       "location": "中国北京市东城区王府井大街全聚德烤鸭店",
//       "latitude": 39.9122,
//       "longitude": 116.4167,
//       "start_time": "2023-11-01T18:30:00+08:00",
//       "end_time": "2023-11-01T20:00:00+08:00",
//       "expenses": [
//         { 
//           "id": 3,
//           "amount": "200",
//           "category": "food",
//           "description": "北京烤鸭晚餐",
//           "expense_date": "2023-11-01"
//         }
//       ]
//     },
//     {
//       "id": 4,
//       "type": "activity",
//       "description": "参观中国国家博物馆，了解中国历史文化",
//       "location": "中国北京市东城区东长安街16号中国国家博物馆",
//       "latitude": 39.9042,
//       "longitude": 116.3914,
//       "start_time": "2023-11-02T09:00:00+08:00",
//       "end_time": "2023-11-02T12:00:00+08:00",
//       "expenses": [
//         {
//           "id": 4,
//           "amount": "0",
//           "category": "tickets",
//           "description": "国博免费参观",
//           "expense_date": "2023-11-02"
//         }
//       ]
//     },
//     {
//       "id": 5,
//       "type": "dining",
//       "description": "在前门大街品尝老北京小吃",
//       "location": "中国北京市东城区前门大街",
//       "latitude": 39.8997,
//       "longitude": 116.4053,
//       "start_time": "2023-11-02T12:30:00+08:00",
//       "end_time": "2023-11-02T14:00:00+08:00",
//       "expenses": [
//         {
//           "id": 5,
//           "amount": "100",
//           "category": "food",
//           "description": "老北京小吃午餐",
//           "expense_date": "2023-11-02"
//         }
//       ]
//     },
//     {
//       "id": 6,
//       "type": "transport",
//       "description": "从酒店前往北京首都国际机场",
//       "location": "中国北京市首都国际机场",
//       "latitude": 40.0799,
//       "longitude": 116.5974,
//       "start_time": "2023-11-02T15:00:00+08:00",
//       "end_time": "2023-11-02T16:00:00+08:00",
//       "expenses": [
//         {
//           "id": 6,
//           "amount": "100",
//           "category": "transport",
//           "description": "机场快轨车费",
//           "expense_date": "2023-11-02"
//         }
//       ]
//     }
//   ]
// }`;
        const parsedContent = JSON.parse(content);

        // 为每个 event 添加一个唯一的临时 ID
        if (parsedContent.events && Array.isArray(parsedContent.events)) {
            parsedContent.events.forEach((event, index) => {
                event.tempId = `temp_${Date.now()}_${index}`;
            });
        }

        return parsedContent;

    } catch (error) {
        console.error('Error calling LLM API:', error);
        throw new Error('Failed to get a valid response from the language model.');
    }
};

module.exports = { callLLMApi };

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
    return `
        You are an expert travel planner AI. Your task is to generate a detailed travel itinerary based on the user's request.
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
              "location": "事件的具体地点 (例如, '新宿御苑')",
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
        1.  All fields in the JSON structure are mandatory. All text values like trip_name and description must be in Chinese.
        2.  If an event has no specific expense, provide an empty array for the "expenses" field: [].
        3.  Ensure all dates and times are in the correct specified format.
        4.  The response must be only the JSON object.
    `;
};

/**
 * 调用大语言模型 API 来生成旅行计划
 * @param {string} prompt - 用户的原始输入
 * @returns {Promise<object>} - 解析后的 JSON 对象，代表旅行计划
 */
const callLLMApi = async (userInput) => {
    // const fullPrompt = buildPrompt(userInput);

    // try {
    //     const response = await fetch(LLM_API_URL, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${API_KEY}` // 根据你的 API 要求调整认证方式
    //         },
    //         body: JSON.stringify({
    //             // 这里的 body 结构需要根据你使用的具体 LLM API 文档进行调整
    //             // 例如, OpenAI 的格式可能是：
    //             // model: "gpt-4-turbo-preview",
    //             // messages: [{ role: "user", content: fullPrompt }],
    //             // response_format: { type: "json_object" }
    //             model: MODEL,
    //             messages: [{ role: "user", content: fullPrompt }]
    //         })
    //     });

    //     if (!response.ok) {
    //         const errorBody = await response.text();
    //         throw new Error(`LLM API request failed with status ${response.status}: ${errorBody}`);
    //     }

    //     const data = await response.json();

    //     // 根据 LLM API 的返回格式，提取出核心的 JSON 内容
    //     // 例如，内容可能在 data.choices[0].message.content 中
    //     const content = data.choices[0].message.content; 

    //     console.log('LLM API raw response content:', content);

        // 解析模型返回的 JSON 字符串

        // 测试时为了方便，直接返回一个模拟的 JSON 对象
        const content = `{
  "trip_name": "东京动漫美食五日探索之旅",
  "start_date": "2024-11-01",
  "end_date": "2024-11-05",
  "budget": "5000",
  "events": [
    {
      "type": "transport",
      "description": "抵达东京成田国际机场，乘坐机场快线前往市区酒店办理入住",
      "location": "成田国际机场至市区酒店",
      "start_time": "2024-11-01T10:00:00+09:00",
      "end_time": "2024-11-01T12:00:00+09:00",
      "expenses": [
        {
          "amount": "3000",
          "category": "transport",
          "description": "机场快线车票（往返预估）",
          "expense_date": "2024-11-01"
        }
      ]
    },
    {
      "type": "accommodation",
      "description": "入住东京市区经济型酒店",
      "location": "东京市区酒店",
      "start_time": "2024-11-01T14:00:00+09:00",
      "end_time": "2024-11-05T12:00:00+09:00",
      "expenses": [
        {
          "amount": "2000",
          "category": "other",
          "description": "四晚住宿费用",
          "expense_date": "2024-11-01"
        }
      ]
    },
    {
      "type": "activity",
      "description": "前往秋叶原，探索动漫文化，参观动漫商店、女仆咖啡厅等",
      "location": "秋叶原",
      "start_time": "2024-11-02T09:00:00+09:00",
      "end_time": "2024-11-02T18:00:00+09:00",
      "expenses": [
        {
          "amount": "500",
          "category": "shopping",
          "description": "动漫周边购物",
          "expense_date": "2024-11-02"
        }
      ]
    },
    {
      "type": "dining",
      "description": "在秋叶原品尝特色动漫主题餐厅美食",
      "location": "秋叶原动漫主题餐厅",
      "start_time": "2024-11-02T12:00:00+09:00",
      "end_time": "2024-11-02T13:30:00+09:00",
      "expenses": [
        {
          "amount": "300",
          "category": "food",
          "description": "动漫主题餐厅午餐",
          "expense_date": "2024-11-02"
        }
      ]
    },
    {
      "type": "activity",
      "description": "前往浅草寺，参观寺庙建筑，感受传统日本文化",
      "location": "浅草寺",
      "start_time": "2024-11-03T10:00:00+09:00",
      "end_time": "2024-11-03T14:00:00+09:00",
      "expenses": []
    },
    {
      "type": "dining",
      "description": "在浅草寺附近品尝传统日式美食，如天妇罗、寿司等",
      "location": "浅草寺周边餐厅",
      "start_time": "2024-11-03T12:00:00+09:00",
      "end_time": "2024-11-03T13:30:00+09:00",
      "expenses": [
        {
          "amount": "400",
          "category": "food",
          "description": "传统日式午餐",
          "expense_date": "2024-11-03"
        }
      ]
    },
    {
      "type": "activity",
      "description": "在东京市区自由探索，可选择前往其他动漫相关景点或购物中心",
      "location": "东京市区",
      "start_time": "2024-11-04T09:00:00+09:00",
      "end_time": "2024-11-04T18:00:00+09:00",
      "expenses": [
        {
          "amount": "500",
          "category": "shopping",
          "description": "购物及其他消费",
          "expense_date": "2024-11-04"
        }
      ]
    },
    {
      "type": "dining",
      "description": "品尝东京特色美食，如拉面、烤鳗鱼等",
      "location": "东京市区餐厅",
      "start_time": "2024-11-04T12:00:00+09:00",
      "end_time": "2024-11-04T13:30:00+09:00",
      "expenses": [
        {
          "amount": "300",
          "category": "food",
          "description": "特色午餐",
          "expense_date": "2024-11-04"
        }
      ]
    },
    {
      "type": "transport",
      "description": "从酒店前往成田国际机场，准备返程",
      "location": "市区酒店至成田国际机场",
      "start_time": "2024-11-05T09:00:00+09:00",
      "end_time": "2024-11-05T11:00:00+09:00",
      "expenses": []
    }
  ]
}`;
        return JSON.parse(content);

    // } catch (error) {
    //     console.error('Error calling LLM API:', error);
    //     throw new Error('Failed to get a valid response from the language model.');
    // }
};

module.exports = { callLLMApi };

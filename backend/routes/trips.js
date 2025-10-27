const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// 从环境变量中获取 Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * POST /api/trips/generate
 * 接收用户旅行需求，模拟 AI 分析，并生成行程存入数据库
 */
/**
 * POST /api/trips/generate
 * 接收用户旅行需求，模拟 AI 分析，并直接返回生成的行程 JSON 数据，不进行持久化。
 */
router.post('/generate', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    try {
        // --- 模拟调用大语言模型 (LLM) ---
        // 在真实场景中，这里会调用 OpenAI, Google Gemini, 或其他 LLM 的 API
        // const aiResponse = await callLLMApi(prompt);

        // 为了演示，我们使用一个硬编码的、符合数据库结构的 JSON 对象作为模拟响应
        const mockLLMResponse = {
            trip_name: "探索东京的奇幻5日之旅 (预览)",
            start_date: "2025-11-10",
            end_date: "2025-11-14",
            budget: 5000,
            events: [
                { type: 'transport', description: '抵达东京成田机场，前往酒店办理入住', location: '成田国际机场', start_time: '2025-11-10T14:00:00Z', end_time: '2025-11-10T16:00:00Z', expenses: [{ amount: 300, category: 'transport', description: '机场大巴', expense_date: '2025-11-10' }] },
                { type: 'dining', description: '在新宿品尝正宗的拉面', location: '新宿区', start_time: '2025-11-10T19:00:00Z', end_time: '2025-11-10T20:30:00Z', expenses: [{ amount: 120, category: 'food', description: '一兰拉面', expense_date: '2025-11-10' }] },
                { type: 'activity', description: '参观浅草寺和仲见世商店街', location: '浅草寺', start_time: '2025-11-11T09:00:00Z', end_time: '2025-11-11T12:00:00Z', expenses: [] },
                { type: 'activity', description: '登上东京晴空塔，俯瞰城市全景', location: '东京晴空塔', start_time: '2025-11-11T14:00:00Z', end_time: '2025-11-11T16:00:00Z', expenses: [{ amount: 180, category: 'entertainment', description: '晴空塔门票', expense_date: '2025-11-11' }] },
            ]
        };
        // --- 模拟结束 ---

        // 直接返回模拟的 AI 响应
        res.status(200).json(mockLLMResponse);

    } catch (error) {
        console.error('Error generating trip preview:', error);
        res.status(500).json({ error: 'Failed to generate trip preview.', details: error.message });
    }
});

/**
 * POST /api/trips
 * 接收一个完整的行程对象并将其持久化到数据库。
 */
router.post('/', async (req, res) => {
    const { tripData, userId } = req.body;

    if (!tripData || !userId) {
        return res.status(400).json({ error: 'Trip data and userId are required.' });
    }

    try {
        // 1. 将行程主体信息插入 'trips' 表
        const { data: newTrip, error: tripError } = await supabase
            .from('trips')
            .insert({
                user_id: userId,
                name: tripData.trip_name,
                start_date: tripData.start_date,
                end_date: tripData.end_date,
                budget: tripData.budget,
            })
            .select()
            .single();

        if (tripError) throw tripError;

        const tripId = newTrip.id;

        // 2. 准备并插入 'trip_events' 数据
        const eventsToInsert = tripData.events.map(event => ({
            trip_id: tripId,
            type: event.type,
            description: event.description,
            location: event.location,
            start_time: event.start_time,
            end_time: event.end_time,
        }));

        const { data: createdEvents, error: eventsError } = await supabase
            .from('trip_events')
            .insert(eventsToInsert)
            .select();

        if (eventsError) throw eventsError;

        // 3. 准备并插入 'expenses' 数据
        const expensesToInsert = [];
        tripData.events.forEach((event, index) => {
            if (event.expenses && event.expenses.length > 0) {
                const correspondingEventId = createdEvents[index].id;
                event.expenses.forEach(expense => {
                    expensesToInsert.push({
                        event_id: correspondingEventId,
                        amount: expense.amount,
                        category: expense.category,
                        description: expense.description,
                        expense_date: expense.expense_date,
                    });
                });
            }
        });

        if (expensesToInsert.length > 0) {
            const { error: expensesError } = await supabase
                .from('expenses')
                .insert(expensesToInsert);

            if (expensesError) throw expensesError;
        }

        // 4. 返回成功响应和新创建的行程 ID
        res.status(201).json({ message: 'Trip saved successfully!', tripId: tripId });

    } catch (error) {
        console.error('Error saving trip:', error);
        res.status(500).json({ error: 'Failed to save trip.', details: error.message });
    }
});

/**
 * GET /api/trips/:id
 * 根据 ID 获取单个行程的详细信息，包括所有事件及其关联的费用
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // 查询行程主体
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('*')
            .eq('id', id)
            .single();

        if (tripError) throw tripError;
        if (!trip) return res.status(404).json({ error: 'Trip not found.' });

        // 查询该行程下的所有事件
        const { data: events, error: eventsError } = await supabase
            .from('trip_events')
            .select('*')
            .eq('trip_id', id)
            .order('start_time', { ascending: true });

        if (eventsError) throw eventsError;

        // 如果有事件，查询所有这些事件关联的费用
        let expenses = [];
        if (events && events.length > 0) {
            const eventIds = events.map(e => e.id);
            const { data: expenseData, error: expensesError } = await supabase
                .from('expenses')
                .select('*')
                .in('event_id', eventIds);
            
            if (expensesError) throw expensesError;
            expenses = expenseData;
        }

        // 将费用数据附加到对应的事件上
        const eventsWithExpenses = events.map(event => ({
            ...event,
            expenses: expenses.filter(exp => exp.event_id === event.id)
        }));

        // 组合数据并返回
        const result = {
            ...trip,
            events: eventsWithExpenses
        };

        res.status(200).json(result);

    } catch (error) {
        console.error(`Error fetching trip ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch trip details.', details: error.message });
    }
});


module.exports = router;

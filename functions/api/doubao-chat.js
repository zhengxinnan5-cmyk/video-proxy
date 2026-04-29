/**
 * Cloudflare Pages Function - 豆包大模型 API 代理
 * 路径: /api/doubao-chat
 * 
 * 功能：转发前端请求到豆包 API，在服务端注入 API Key，避免前端暴露密钥
 */

// 豆包 API 配置（服务端安全存储）
const DOUBAO_API_KEY = '0827cad9-13c8-47ce-a59b-631519a474fa';
const DOUBAO_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';

export async function onRequest(context) {
  const { request } = context;

  // 只处理 POST 请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported' 
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 读取前端传来的请求体
    const body = await request.json();

    // 转发到豆包 API
    const response = await fetch(`${DOUBAO_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    // 获取响应
    const data = await response.json();

    // 返回给前端
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Proxy error',
      message: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

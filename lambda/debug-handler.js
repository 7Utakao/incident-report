exports.handler = async (event, context) => {
  console.log('Full Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'Debug response',
      eventKeys: Object.keys(event),
      requestContext: event.requestContext ? Object.keys(event.requestContext) : 'undefined',
      httpMethod: event.requestContext?.http?.method || 'undefined',
      httpPath: event.requestContext?.http?.path || 'undefined',
      routeKey: event.routeKey || 'undefined',
    }),
  };
};

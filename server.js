const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const app = new Koa();
app.use(
	koaBody({
		urlencoded: true,
	})
);

const tickets = [
	{
		id: '1',
		name: 'Почистить стол',
		description: 'Почистить стол синий тряпкой',
		status: 'false',
		created: '1744136198394',
	},
	{
		id: '2',
		name: 'Протереть шкаф',
		description: 'Протереть шкаф красной тряпкой',
		status: 'false',
		created: '1744136198394',
	},
	{
		id: '3',
		name: 'Помыть окно',
		description: 'Помыть окно серой тряпкой',
		status: 'false',
		created: '1744136198000',
	},
];

app.use(async (ctx, next) => {
	const origin = ctx.request.get('Origin');
	if (!origin) {
		return await next();
	}
	const headers = { 'Access-Control-Allow-Origin': '*' };
	if (ctx.request.method !== 'OPTIONS') {
		ctx.response.set({ ...headers });
		try {
			return await next();
		} catch (e) {
			e.headers = { ...e.headers, ...headers };
			throw e;
		}
	}
	if (ctx.request.get('Access-Control-Request-Method')) {
		ctx.response.set({
			...headers,
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
		});
		if (ctx.request.get('Access-Control-Request-Headers')) {
			ctx.response.set(
				'Access-Control-Allow-Headers',
				ctx.request.get('Access-Control-Allow-Request-Headers')
			);
		}
		ctx.response.status = 204; // No content
	}
});

app.use(async (ctx, next) => {
	if (ctx.method !== 'GET') {
		return await next();
	}
	const { method, id } = ctx.request.query;
	switch (method) {
		case 'allTickets': {
			ctx.response.body = tickets;
			return;
		}
		case 'ticketById': {
			const ticket = tickets.find(ticket => ticket.id === id);
			ctx.response.body = ticket;
			return;
		}
		default: {
			ctx.response.body = 'Ticket not found';
			ctx.response.status = 404;
			return;
		}
	}
});

app.use(async (ctx, next) => {
	if (ctx.method !== 'POST') {
		return await next();
	}
	if (tickets.findIndex(ticket => ticket.id === ctx.request.body.id) >= 0) {
		ctx.response.status = 400;
		ctx.response.body = 'Ticket already created';
		return;
	}
	tickets.push(ctx.request.body);
	ctx.response.body = 'Added';
});

app.use(async (ctx, next) => {
	if (ctx.method !== 'PUT') {
		return await next();
	}
	const findIndex = tickets.findIndex(
		ticket => ticket.id === ctx.request.body.id
	);
	if (findIndex === -1) {
		ctx.response.status = 404;
		ctx.response.body = 'Ticket not found';
	}
	tickets.splice(findIndex, 1, ctx.request.body);
	ctx.response.body = 'Ticket was redacted';
});

app.use(async (ctx, next) => {
	if (ctx.method !== 'DELETE') {
		return await next();
	}
	const ticket = tickets.findIndex(
		ticket => ticket.id === ctx.request.query.id
	);
	if (ticket === -1) {
		ctx.response.status = 404;
		ctx.response.body = 'Ticket not found';
		return;
	}
	tickets.splice(ticket, 1);
	ctx.response.body = 'Success';
});

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);

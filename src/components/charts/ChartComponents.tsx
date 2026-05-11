import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	Radar,
	CartesianGrid,
} from "recharts";
import { Answers } from "../../types";

/* ── Светлая палитра (в стиле Word) ───────────────────── */
const COLORS = [
	"#0078d4", // основной синий
	"#107c10", // зелёный
	"#d83b01", // оранжевый
	"#8764b8", // фиолетовый
	"#f2a900", // жёлтый
	"#5c2d91",
	"#00b4a6",
];

/* ── Helpers ─────────────────────────────────────────── */
function countField(
	responses: { answers: Answers }[],
	field: string,
): { name: string; value: number }[] {
	const counts: Record<string, number> = {};
	for (const r of responses) {
		const v = r.answers[field as keyof Answers];
		if (v !== undefined && v !== null && v !== "") {
			const key = String(v);
			counts[key] = (counts[key] ?? 0) + 1;
		}
	}
	return Object.entries(counts)
		.map(([name, value]) => ({ name, value }))
		.sort((a, b) => b.value - a.value);
}

/* ── 1. Намерение переехать ─────────────────────────── */
/* ── 1. Намерение переехать (исправленный) ───────────── */
export function MobilityIntentChart({
	responses,
}: {
	responses: { answers: Answers }[];
}) {
	const rawData = countField(responses, "plan_to_move");

	// Сокращаем длинные варианты для лучшей читаемости
	const shortenLabel = (label: string): string => {
		if (label.includes("за рубеж")) return "За рубеж";
		if (label.includes("другой город")) return "В другой город";
		if (label.includes("Ещё не решил")) return "Ещё не решил(а)";
		if (label.includes("Не планирую")) return "Не планирую";
		return label;
	};

	const data = rawData.map((item) => ({
		name: shortenLabel(item.name),
		fullName: item.name, // для тултипа
		value: item.value,
	}));

	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload?.length) {
			const item = payload[0].payload;
			return (
				<div className="chart-tooltip">
					<p className="tooltip-label">{item.fullName}</p>
					<p className="tooltip-value">{item.value} человек</p>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="chart-card">
			<h2>Намерение переехать</h2>
			<ResponsiveContainer width="100%" height={280}>
				<BarChart
					data={data}
					layout="vertical"
					margin={{ left: 15, right: 40, top: 10, bottom: 10 }}
				>
					<XAxis
						type="number"
						tick={{ fill: "#555", fontSize: 12 }}
						allowDecimals={false}
					/>
					<YAxis
						type="category"
						dataKey="name"
						width={160}
						tick={{
							fill: "#333",
							fontSize: 13,
							width: 150,
							textAnchor: "end",
						}}
					/>
					<Tooltip content={<CustomTooltip />} />
					<Bar dataKey="value" radius={[0, 6, 6, 0]}>
						{data.map((_, i) => (
							<Cell key={i} fill={COLORS[i % COLORS.length]} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
/* ── 2. Пол респондентов (Donut) ─────────────────────── */
export function GenderChart({
	responses,
}: {
	responses: { answers: Answers }[];
}) {
	const data = countField(responses, "gender");
	const total = data.reduce((s, d) => s + d.value, 0);

	return (
		<div className="chart-card">
			<h2>Пол респондентов</h2>
			<div style={{ display: "flex", alignItems: "center", gap: 32 }}>
				<ResponsiveContainer width="45%" height={220}>
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={95}
							dataKey="value"
							labelLine={false}
						>
							{data.map((_, i) => (
								<Cell key={i} fill={COLORS[i % COLORS.length]} />
							))}
						</Pie>
					</PieChart>
				</ResponsiveContainer>

				<div style={{ flex: 1 }}>
					{data.map((d, i) => (
						<div key={d.name} className="legend-row">
							<span
								className="legend-dot"
								style={{ background: COLORS[i % COLORS.length] }}
							/>
							<span className="legend-name">{d.name}</span>
							<span className="legend-val">
								{d.value}{" "}
								<span className="legend-pct">
									({total ? Math.round((d.value / total) * 100) : 0}%)
								</span>
							</span>
						</div>
					))}
					<div className="legend-total">Всего: {total}</div>
				</div>
			</div>
		</div>
	);
}

/* ── 3. Миграция по типу населённого пункта ─────────── */
export function LocationShiftChart({
	responses,
}: {
	responses: { answers: Answers }[];
}) {
	const categories = [
		"Областной центр",
		"Город",
		"Посёлок городского типа (ПГТ)",
		"Село / деревня",
	];
	const short = ["Обл. центр", "Город", "ПГТ", "Село"];

	const data = categories.map((cat, i) => {
		const origin = responses.filter((r) => r.answers.origin === cat).length;
		const current = responses.filter(
			(r) => r.answers.current_location === cat,
		).length;
		return { name: short[i], Откуда: origin, Сейчас: current };
	});

	return (
		<div className="chart-card">
			<h2>Миграция: откуда → где сейчас</h2>
			<ResponsiveContainer width="100%" height={240}>
				<BarChart data={data} barCategoryGap={20}>
					<CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
					<XAxis dataKey="name" tick={{ fill: "#444", fontSize: 13 }} />
					<YAxis tick={{ fill: "#555", fontSize: 12 }} />
					<Tooltip
						contentStyle={{
							background: "#fff",
							border: "1px solid #d1d1d1",
							borderRadius: 8,
							color: "#1a1a1a",
						}}
					/>
					<Legend />
					<Bar dataKey="Откуда" fill="#0078d4" radius={[4, 4, 0, 0]} />
					<Bar dataKey="Сейчас" fill="#107c10" radius={[4, 4, 0, 0]} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

/* ── 4. Уровень удовлетворённости ───────────────────── */
/* ── 4. Уровень удовлетворённости (Средние значения) ───── */
export function SatisfactionAreaChart({
	responses,
}: {
	responses: { answers: Answers }[];
}) {
	// Подсчёт среднего значения
	const calculateAverage = (field: keyof Answers) => {
		const validResponses = responses.filter(
			(r) => r.answers[field] !== undefined && r.answers[field] !== null,
		);
		if (validResponses.length === 0) return 0;

		const sum = validResponses.reduce(
			(acc, r) => acc + Number(r.answers[field]),
			0,
		);
		return Number((sum / validResponses.length).toFixed(1));
	};

	const data = [
		{
			category: "Удовлетворённость жизнью",
			avg: calculateAverage("life_satisfaction"),
			fill: "#0078d4",
		},
		{
			category: "Материальное положение",
			avg: calculateAverage("material_satisfaction"),
			fill: "#107c10",
		},
		{
			category: "Работа / карьера",
			avg: calculateAverage("job_satisfaction"),
			fill: "#d83b01",
		},
	];

	return (
		<div className="chart-card">
			<h2>Средний уровень удовлетворённости</h2>
			<p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "16px" }}>
				По шкале от 1 до 5
			</p>

			<ResponsiveContainer width="100%" height={260}>
				<BarChart
					data={data}
					layout="vertical"
					margin={{ left: 20, right: 30, top: 10, bottom: 10 }}
				>
					<XAxis
						type="number"
						domain={[0, 5]}
						ticks={[1, 2, 3, 4, 5]}
						tick={{ fill: "#555", fontSize: 12 }}
					/>
					<YAxis
						type="category"
						dataKey="category"
						width={140}
						tick={{ fill: "#333", fontSize: 13 }}
					/>
					<Tooltip
						contentStyle={{
							background: "#fff",
							border: "1px solid #d1d1d1",
							borderRadius: 8,
							color: "#1a1a1a",
						}}
						formatter={(value: number) => [`${value} баллов`, "Среднее"]}
					/>
					<Bar dataKey="avg" radius={[0, 6, 6, 0]}>
						{data.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.fill} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>

			{/* Подписи под графиком */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginTop: "12px",
					fontSize: "0.8rem",
					color: "#666",
				}}
			>
				<div>1 — Очень низко</div>
				<div>5 — Очень высоко</div>
			</div>
		</div>
	);
}

/* ── 5. Причины переезда (Radar) ─────────────────────── */
export function MoveReasonsRadar({
	responses,
}: {
	responses: { answers: Answers }[];
}) {
	const reasons = [
		"Работа / карьера",
		"Образование",
		"Семья / личная жизнь",
		"Более высокий уровень жизни",
		"Другое",
	];
	const short = ["Карьера", "Образование", "Семья", "Уровень жизни", "Другое"];

	const total = responses.length || 1;

	const data = reasons.map((reason, i) => ({
		subject: short[i],
		value: Math.round(
			(responses.filter((r) => r.answers.move_reason === reason).length /
				total) *
				100,
		),
	}));

	return (
		<div className="chart-card">
			<h2>Причины переезда (%)</h2>
			<ResponsiveContainer width="100%" height={280}>
				<RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
					<PolarGrid stroke="#e5e5e5" />
					<PolarAngleAxis
						dataKey="subject"
						tick={{ fill: "#333", fontSize: 13 }}
					/>
					<Radar
						name="Причина"
						dataKey="value"
						stroke="#d83b01"
						fill="#d83b01"
						fillOpacity={0.25}
						strokeWidth={3}
					/>
					<Tooltip
						contentStyle={{
							background: "#fff",
							border: "1px solid #d1d1d1",
							borderRadius: 8,
						}}
						formatter={(v: number) => [`${v}%`, "Доля"]}
					/>
				</RadarChart>
			</ResponsiveContainer>
		</div>
	);
}

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { SurveyResponse } from "../types";
import {
	MobilityIntentChart,
	GenderChart,
	LocationShiftChart,
	SatisfactionAreaChart,
	MoveReasonsRadar,
} from "../components/charts/ChartComponents";

/* ─────────────────────────── Login ─────────────────── */
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "admin123";

function LoginPage({ onLogin }: { onLogin: () => void }) {
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	function handleLogin() {
		if (password === ADMIN_PASSWORD) {
			sessionStorage.setItem("admin_auth", "1");
			onLogin();
		} else {
			setError("Неверный пароль");
		}
	}

	return (
		<div className="login-page">
			<div className="login-card">
				<h1>Панель администратора</h1>
				<p>Введите пароль для доступа к статистике опроса.</p>
				<div className="form-group">
					<label htmlFor="pwd">Пароль</label>
					<input
						id="pwd"
						className="form-input"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleLogin()}
						placeholder="••••••••"
					/>
					{error && <p className="error-msg">{error}</p>}
				</div>
				<button className="btn-admin" onClick={handleLogin}>
					Войти
				</button>
			</div>
		</div>
	);
}

/* ─────────────────────────── Stat card ─────────────── */
function StatCard({ value, label }: { value: string | number; label: string }) {
	return (
		<div className="stat-card">
			<div className="stat-value">{value}</div>
			<div className="stat-label">{label}</div>
		</div>
	);
}

/* ─────────────────────────── Dashboard ─────────────── */
function Dashboard({ onLogout }: { onLogout: () => void }) {
	const [responses, setResponses] = useState<SurveyResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [fetchError, setFetchError] = useState("");

	useEffect(() => {
		async function load() {
			setLoading(true);
			const { data, error } = await supabase
				.from("survey_responses")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) {
				setFetchError("Ошибка загрузки данных: " + error.message);
			} else {
				setResponses(data ?? []);
			}
			setLoading(false);
		}
		load();
	}, []);

	/* ── Derived stats ──────────────────────────────── */
	const total = responses.length;

	const movers = responses.filter(
		(r) =>
			r.answers.plan_to_move === "Да, в другой город страны" ||
			r.answers.plan_to_move === "Да, за рубеж",
	).length;
	const moverPct = total ? Math.round((movers / total) * 100) : 0;

	const avgLifeSat =
		total > 0
			? (
					responses.reduce(
						(s, r) => s + (Number(r.answers.life_satisfaction) || 0),
						0,
					) / total
				).toFixed(1)
			: "—";

	const studyMoved = responses.filter(
		(r) => r.answers.moved_for_education === "Да",
	).length;
	const studyMovedPct = total ? Math.round((studyMoved / total) * 100) : 0;

	/* ── Today count ─────────────────────────────── */
	const todayCount = responses.filter((r) => {
		const d = new Date(r.created_at);
		const now = new Date();
		return (
			d.getFullYear() === now.getFullYear() &&
			d.getMonth() === now.getMonth() &&
			d.getDate() === now.getDate()
		);
	}).length;

	return (
		<div className="admin-page">
			{/* Nav */}
			<nav className="admin-nav">
				<h1>📊 Территориальная мобильность молодёжи</h1>
				<button className="btn-logout" onClick={onLogout}>
					Выйти
				</button>
			</nav>

			<div className="admin-content">
				{fetchError && (
					<p className="error-msg" style={{ marginBottom: 24 }}>
						{fetchError}
					</p>
				)}

				{loading ? (
					<div className="loading-state">
						<div className="spinner" />
						<p>Загрузка данных...</p>
					</div>
				) : total === 0 ? (
					<div className="empty-state">
						<p style={{ fontSize: "3rem", marginBottom: 16 }}>📭</p>
						<p>Ответов пока нет. Поделитесь ссылкой на анкету!</p>
					</div>
				) : (
					<>
						{/* Stats */}
						<div className="stats-grid">
							<StatCard value={total} label="Всего ответов" />
							<StatCard value={todayCount} label="Ответов сегодня" />
							<StatCard value={`${moverPct}%`} label="Планируют переехать" />
							<StatCard value={avgLifeSat} label="Средняя удовл. жизнью" />
							<StatCard
								value={`${studyMovedPct}%`}
								label="Переезжали ради учёбы"
							/>
						</div>

						{/* Section */}
						<p className="section-title">Графики</p>

						<div className="charts-grid">
							<GenderChart responses={responses} />
							<MobilityIntentChart responses={responses} />
							<LocationShiftChart responses={responses} />
							<SatisfactionAreaChart responses={responses} />
							<MoveReasonsRadar responses={responses} />
						</div>
					</>
				)}
			</div>
		</div>
	);
}

/* ─────────────────────────── Page ──────────────────── */
export default function Admin() {
	const [authed, setAuthed] = useState(
		() => sessionStorage.getItem("admin_auth") === "1",
	);

	function handleLogin() {
		setAuthed(true);
	}

	function handleLogout() {
		sessionStorage.removeItem("admin_auth");
		setAuthed(false);
	}

	return authed ? (
		<Dashboard onLogout={handleLogout} />
	) : (
		<LoginPage onLogin={handleLogin} />
	);
}

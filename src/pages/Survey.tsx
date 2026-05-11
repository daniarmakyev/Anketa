import { useState } from "react";
import { supabase } from "../lib/supabase";
import { questions } from "../data/questions";
import { Question } from "../types";

type Answers = Record<string, string | number>;

function ProgressBar({ current, total }: { current: number; total: number }) {
	const pct = Math.round((current / total) * 100);
	return (
		<div className="progress-wrapper">
			<div className="progress-label">
				<span>
					Вопрос {current} из {total}
				</span>
				<span>{pct}%</span>
			</div>
			<div className="progress-track">
				<div className="progress-fill" style={{ width: `${pct}%` }} />
			</div>
		</div>
	);
}

function RadioQuestion({
	question,
	value,
	onChange,
}: {
	question: Question;
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<div className="options-list">
			{question.options!.map((opt) => (
				<label
					key={opt}
					className={`option-label ${value === opt ? "selected" : ""}`}
				>
					<input
						type="radio"
						name={question.id}
						value={opt}
						checked={value === opt}
						onChange={() => onChange(opt)}
					/>
					{opt}
				</label>
			))}
		</div>
	);
}

function ScaleQuestion({
	question,
	value,
	onChange,
}: {
	question: Question;
	value: number;
	onChange: (v: number) => void;
}) {
	const nums = Array.from(
		{ length: question.scaleMax! - question.scaleMin! + 1 },
		(_, i) => i + question.scaleMin!,
	);
	return (
		<div className="scale-wrapper">
			<div className="scale-buttons">
				{nums.map((n) => (
					<button
						key={n}
						type="button"
						className={`scale-btn ${value === n ? "selected" : ""}`}
						onClick={() => onChange(n)}
					>
						{n}
					</button>
				))}
			</div>
			{question.scaleLabels && (
				<div className="scale-labels">
					<span>{question.scaleLabels[0]}</span>
					<span>{question.scaleLabels[1]}</span>
				</div>
			)}
		</div>
	);
}

export default function Survey() {
	const [step, setStep] = useState(0);
	const [answers, setAnswers] = useState<Answers>({});
	const [submitted, setSubmitted] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const current = questions[step];
	const isLast = step === questions.length - 1;
	const currentAnswer = answers[current?.id ?? ""];
	const hasAnswer = currentAnswer !== undefined && currentAnswer !== "";

	function setAnswer(val: string | number) {
		setAnswers((prev) => ({ ...prev, [current.id]: val }));
	}

	async function handleSubmit() {
		setSubmitting(true);
		setError("");
		try {
			const { error: err } = await supabase
				.from("survey_responses")
				.insert([{ answers }]);
			if (err) throw err;
			setSubmitted(true);
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : "Неизвестная ошибка";
			setError("Ошибка при отправке: " + msg);
		} finally {
			setSubmitting(false);
		}
	}

	if (submitted) {
		return (
			<div className="page">
				<div className="card">
					<div className="success-screen">
						<div className="success-icon">✓</div>
						<h1 style={{ marginBottom: 12 }}>Спасибо!</h1>
						<p>
							Ваши ответы успешно записаны. Они помогут в исследовании
							территориальной мобильности молодёжи.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="page">
			<div className="card">
				<div className="survey-header">
					<span className="badge">Анкета</span>
					<h1>Территориальная мобильность молодёжи</h1>
					<p>Пройдите опрос — это займёт около 3–5 минут.</p>
				</div>

				<ProgressBar current={step + 1} total={questions.length} />

				<div className="question-block" key={current.id}>
					<p className="question-text">{current.text}</p>

					{current.type === "radio" && (
						<RadioQuestion
							question={current}
							value={(currentAnswer as string) ?? ""}
							onChange={setAnswer}
						/>
					)}

					{current.type === "scale" && (
						<ScaleQuestion
							question={current}
							value={(currentAnswer as number) ?? 0}
							onChange={setAnswer}
						/>
					)}
				</div>

				{error && (
					<p className="error-msg" style={{ marginTop: 16 }}>
						{error}
					</p>
				)}

				<div className="nav-buttons">
					{step > 0 && (
						<button
							className="btn btn-secondary"
							onClick={() => setStep((s) => s - 1)}
						>
							← Назад
						</button>
					)}

					{!isLast ? (
						<button
							className="btn btn-primary"
							disabled={!hasAnswer}
							onClick={() => setStep((s) => s + 1)}
						>
							Далее →
						</button>
					) : (
						<button
							className="btn btn-primary"
							disabled={!hasAnswer || submitting}
							onClick={handleSubmit}
						>
							{submitting ? "Отправка..." : "Отправить ответы"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

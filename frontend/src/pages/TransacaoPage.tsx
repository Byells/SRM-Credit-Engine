import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { fetchWithCache } from "../services/cachedFetch";
import Button from "../components/Button";
import Select from "../components/Select";
import Spinner from "../components/Spinner";
import { useToast } from "../components/ToastProvider";
import {
  normalizeNumberString,
  formatCurrencyBR,
  toNumber as toNumberUtil,
} from "../utils/number";

interface Moeda {
  id: number;
  nome: string;
  codigo: string;
}

interface TipoRecebivel {
  id: number;
  nome: string;
  spread: string;
}

interface Cedente {
  id: number;
  nome: string;
}

interface TaxaBase {
  nome: string;
  valor: string;
}

function calcularValorPresente(
  valorFace: number,
  taxaBase: number,
  spread: number,
  prazoMeses: number,
) {
  const denominador = Math.pow(1 + taxaBase + spread, prazoMeses);
  return valorFace / denominador;
}

type FormValues = {
  cedenteId: string;
  produtoId: string;
  moedaTituloId: string;
  moedaPagamentoId: string;
  valorFace: string;
  prazoMeses: string;
};

const FORM_FIELDS: (keyof FormValues)[] = [
  "cedenteId",
  "produtoId",
  "moedaTituloId",
  "moedaPagamentoId",
  "valorFace",
  "prazoMeses",
];

function validateField(
  field: keyof FormValues,
  values: FormValues,
): string | undefined {
  switch (field) {
    case "cedenteId":
      return values.cedenteId ? undefined : "Selecione um cedente";
    case "produtoId":
      return values.produtoId ? undefined : "Selecione um tipo de recebível";
    case "moedaTituloId":
      return values.moedaTituloId
        ? undefined
        : "Selecione a moeda do título";
    case "moedaPagamentoId":
      return values.moedaPagamentoId
        ? undefined
        : "Selecione a moeda de pagamento";
    case "valorFace": {
      if (values.valorFace.trim() === "") return "Informe o valor face";
      const n = toNumberUtil(normalizeNumberString(values.valorFace));
      if (Number.isNaN(n)) return "Valor face inválido";
      if (n <= 0) return "Valor face deve ser maior que 0";
      return undefined;
    }
    case "prazoMeses": {
      if (values.prazoMeses.trim() === "") return "Informe o prazo";
      const n = toNumberUtil(normalizeNumberString(values.prazoMeses));
      if (Number.isNaN(n)) return "Prazo inválido";
      if (!Number.isInteger(n)) return "Prazo deve ser um número inteiro";
      if (n <= 0) return "Prazo deve ser maior que 0";
      if (n > 360) return "Prazo máximo é 360 meses";
      return undefined;
    }
    default:
      return undefined;
  }
}

function validateAll(values: FormValues): Partial<Record<keyof FormValues, string>> {
  const errors: Partial<Record<keyof FormValues, string>> = {};
  for (const field of FORM_FIELDS) {
    const error = validateField(field, values);
    if (error) errors[field] = error;
  }
  return errors;
}

function TransacaoPage() {
  const [moedas, setMoedas] = useState<Moeda[]>([]);
  const [tipos, setTipos] = useState<TipoRecebivel[]>([]);
  const [cedentes, setCedentes] = useState<Cedente[]>([]);
  const [taxaBaseAtual, setTaxaBaseAtual] = useState(0.005);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<FormValues>({
    cedenteId: "1",
    produtoId: "1",
    moedaTituloId: "1",
    moedaPagamentoId: "1",
    valorFace: "1000.00",
    prazoMeses: "6",
  });

  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError: showErrorToast } = useToast();

  const fieldErrors = useMemo(() => validateAll(form), [form]);
  const hasErrors = Object.keys(fieldErrors).length > 0;
  const showError = (field: keyof FormValues) =>
    touched[field] || submitAttempted ? fieldErrors[field] : undefined;

  const FALLBACK_TIPOS: TipoRecebivel[] = [
    { id: 1, nome: "Duplicata Mercantil", spread: "0.0150" },
    { id: 2, nome: "Cheque Pré-datado", spread: "0.0250" },
  ];
  const FALLBACK_CEDENTES: Cedente[] = [{ id: 1, nome: "Empresa Exemplo SA" }];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [moedasRes, tiposRes, cedentesRes, taxaBaseRes] =
          await Promise.allSettled([
            api.get<Moeda[]>("/moedas"),
            fetchWithCache("srm:tipos_recebiveis", () =>
              api.get<TipoRecebivel[]>("/tipos_recebiveis").then((r) => r.data),
            ),
            fetchWithCache("srm:cedentes", () =>
              api.get<Cedente[]>("/cedentes").then((r) => r.data),
            ),
            fetchWithCache("srm:taxa-base", () =>
              api.get<TaxaBase>("/taxa-base").then((r) => r.data),
            ),
          ]);

        if (moedasRes.status === "fulfilled") setMoedas(moedasRes.value.data);
        if (tiposRes.status === "fulfilled") setTipos(tiposRes.value);
        else setTipos(FALLBACK_TIPOS);

        if (cedentesRes.status === "fulfilled") setCedentes(cedentesRes.value);
        else setCedentes(FALLBACK_CEDENTES);

        if (taxaBaseRes.status === "fulfilled")
          setTaxaBaseAtual(toNumberUtil(taxaBaseRes.value.valor));
      } catch (err) {
        console.error(err);
        setTipos(FALLBACK_TIPOS);
        setCedentes(FALLBACK_CEDENTES);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleChange = (field: keyof FormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const handleBlur = (field: keyof FormValues) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const preview = useMemo(() => {
    const valorFace = toNumberUtil(normalizeNumberString(form.valorFace));
    const prazo = Math.floor(
      toNumberUtil(normalizeNumberString(form.prazoMeses)),
    );
    const tipo =
      tipos.find((t) => String(t.id) === String(form.produtoId)) ||
      FALLBACK_TIPOS[0];
    const spread = toNumberUtil(tipo.spread);

    if (Number.isNaN(valorFace) || valorFace <= 0 || prazo <= 0) return null;
    const vp = calcularValorPresente(valorFace, taxaBaseAtual, spread, prazo);
    return vp;
  }, [form, tipos, taxaBaseAtual]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (Object.keys(validateAll(form)).length > 0) return;
    setSubmitting(true);
    try {
      const payload = {
        cedenteId: Number(form.cedenteId),
        produtoId: Number(form.produtoId),
        moedaTituloId: Number(form.moedaTituloId),
        moedaPagamentoId: Number(form.moedaPagamentoId),
        valorFace: normalizeNumberString(form.valorFace),
        prazoMeses: Number(normalizeNumberString(form.prazoMeses)),
      } as const;

      const response = await api.post("/transacoes", payload);
      const valorLiquido = response.data?.valorLiquido;
      showSuccess(
        valorLiquido
          ? `Transação criada (id: ${response.data.id}) — valor líquido: ${formatCurrencyBR(valorLiquido)}`
          : `Transação criada (id: ${response.data?.id ?? JSON.stringify(response.data)})`,
      );
    } catch (error: any) {
      console.error(error);
      showErrorToast(error?.response?.data?.erro || "Erro ao criar transação");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Simulação de Transação</h1>

      {loading ? (
        <Spinner label="Carregando dados..." />
      ) : (
        <form onSubmit={handleSubmit} className="form-grid">
          <Select
            label="Cedente"
            value={form.cedenteId}
            onChange={(e) => handleChange("cedenteId", e.target.value)}
            onBlur={() => handleBlur("cedenteId")}
            error={showError("cedenteId")}
            options={cedentes.map((c) => ({ value: c.id, label: c.nome }))}
          />

          <Select
            label="Tipo de Recebível"
            value={form.produtoId}
            onChange={(e) => handleChange("produtoId", e.target.value)}
            onBlur={() => handleBlur("produtoId")}
            error={showError("produtoId")}
            options={tipos.map((tipo) => ({
              value: tipo.id,
              label: tipo.nome,
            }))}
          />

          <Select
            label="Moeda Título"
            value={form.moedaTituloId}
            onChange={(e) => handleChange("moedaTituloId", e.target.value)}
            onBlur={() => handleBlur("moedaTituloId")}
            error={showError("moedaTituloId")}
            options={
              moedas.length
                ? moedas.map((moeda) => ({
                    value: moeda.id,
                    label: `${moeda.nome} (${moeda.codigo})`,
                  }))
                : [{ value: "1", label: "BRL" }]
            }
          />

          <Select
            label="Moeda Pagamento"
            value={form.moedaPagamentoId}
            onChange={(e) => handleChange("moedaPagamentoId", e.target.value)}
            onBlur={() => handleBlur("moedaPagamentoId")}
            error={showError("moedaPagamentoId")}
            options={
              moedas.length
                ? moedas.map((moeda) => ({
                    value: moeda.id,
                    label: `${moeda.nome} (${moeda.codigo})`,
                  }))
                : [{ value: "1", label: "BRL" }]
            }
          />

          <label>
            Valor Face
            <input
              type="text"
              value={form.valorFace}
              onChange={(e) => handleChange("valorFace", e.target.value)}
              onFocus={() => {
                const raw = normalizeNumberString(form.valorFace);
                handleChange("valorFace", raw);
              }}
              onBlur={() => {
                const formatted = formatCurrencyBR(
                  normalizeNumberString(form.valorFace),
                );
                handleChange("valorFace", formatted);
                handleBlur("valorFace");
              }}
              className={showError("valorFace") ? "field-invalid" : undefined}
            />
            {showError("valorFace") && (
              <span className="field-error-message">
                {showError("valorFace")}
              </span>
            )}
          </label>

          <label>
            Prazo (meses)
            <input
              type="number"
              value={form.prazoMeses}
              onChange={(e) => handleChange("prazoMeses", e.target.value)}
              onBlur={() => handleBlur("prazoMeses")}
              className={
                showError("prazoMeses") ? "field-invalid" : undefined
              }
            />
            {showError("prazoMeses") && (
              <span className="field-error-message">
                {showError("prazoMeses")}
              </span>
            )}
          </label>

          <div style={{ gridColumn: "1 / -1" }}>
            <strong>Preview (valor líquido estimado): </strong>
            {preview === null ? (
              <span>- informe Valor e Prazo válidos -</span>
            ) : (
              <span>{formatCurrencyBR(preview)}</span>
            )}
          </div>

          <Button type="submit" disabled={submitting || hasErrors}>
            {submitting ? "Enviando..." : "Calcular e Criar"}
          </Button>
        </form>
      )}
    </div>
  );
}

export default TransacaoPage;

import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Button from "../components/Button";
import Select from "../components/Select";
import Spinner from "../components/Spinner";
import { useToast } from "../components/ToastProvider";
import { normalizeNumberString } from "../utils/number";

interface Moeda {
  id: number;
  nome: string;
  codigo: string;
}

interface TaxaCambio {
  id: number;
  moedaOrigem: Moeda;
  moedaDestino: Moeda;
  valorTaxa: string;
  dataTaxa: string;
}

type FormValues = {
  moedaOrigemId: string;
  moedaDestinoId: string;
  valorTaxa: string;
};

const FORM_FIELDS: (keyof FormValues)[] = [
  "moedaOrigemId",
  "moedaDestinoId",
  "valorTaxa",
];

function validateField(
  field: keyof FormValues,
  values: FormValues,
): string | undefined {
  switch (field) {
    case "moedaOrigemId":
      return values.moedaOrigemId ? undefined : "Selecione a moeda de origem";
    case "moedaDestinoId":
      if (!values.moedaDestinoId) return "Selecione a moeda de destino";
      if (values.moedaDestinoId === values.moedaOrigemId)
        return "Moeda de destino deve ser diferente da origem";
      return undefined;
    case "valorTaxa": {
      if (values.valorTaxa.trim() === "") return "Informe a taxa";
      const n = Number(normalizeNumberString(values.valorTaxa));
      if (Number.isNaN(n)) return "Taxa inválida";
      if (n <= 0) return "Taxa deve ser maior que 0";
      return undefined;
    }
    default:
      return undefined;
  }
}

function validateAll(
  values: FormValues,
): Partial<Record<keyof FormValues, string>> {
  const errors: Partial<Record<keyof FormValues, string>> = {};
  for (const field of FORM_FIELDS) {
    const error = validateField(field, values);
    if (error) errors[field] = error;
  }
  return errors;
}

function CambioPage() {
  const [moedas, setMoedas] = useState<Moeda[]>([]);
  const [taxas, setTaxas] = useState<TaxaCambio[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError: showErrorToast } = useToast();

  const [form, setForm] = useState<FormValues>({
    moedaOrigemId: "",
    moedaDestinoId: "",
    valorTaxa: "",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const fieldErrors = useMemo(() => validateAll(form), [form]);
  const hasErrors = Object.keys(fieldErrors).length > 0;
  const showError = (field: keyof FormValues) =>
    touched[field] || submitAttempted ? fieldErrors[field] : undefined;

  const carregar = async () => {
    setLoading(true);
    try {
      const [moedasRes, taxasRes] = await Promise.allSettled([
        api.get<Moeda[]>("/moedas"),
        api.get<TaxaCambio[]>("/cambio"),
      ]);

      if (moedasRes.status === "fulfilled") setMoedas(moedasRes.value.data);
      if (taxasRes.status === "fulfilled") setTaxas(taxasRes.value.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleChange = (field: keyof FormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const handleBlur = (field: keyof FormValues) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (Object.keys(validateAll(form)).length > 0) return;
    setSubmitting(true);
    try {
      await api.post("/cambio", {
        moedaOrigemId: Number(form.moedaOrigemId),
        moedaDestinoId: Number(form.moedaDestinoId),
        valorTaxa: normalizeNumberString(form.valorTaxa),
      });
      showSuccess("Taxa de câmbio cadastrada com sucesso");
      setForm({ moedaOrigemId: "", moedaDestinoId: "", valorTaxa: "" });
      setTouched({});
      setSubmitAttempted(false);
      await carregar();
    } catch (error: any) {
      console.error(error);
      showErrorToast(
        error?.response?.data?.erro || "Erro ao cadastrar taxa de câmbio",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Gestão de Câmbio</h1>

      {loading ? (
        <Spinner label="Carregando dados..." />
      ) : (
        <>
          <form onSubmit={handleSubmit} className="form-grid">
            <Select
              label="Moeda Origem"
              value={form.moedaOrigemId}
              onChange={(e) => handleChange("moedaOrigemId", e.target.value)}
              onBlur={() => handleBlur("moedaOrigemId")}
              error={showError("moedaOrigemId")}
              options={[
                { value: "", label: "Selecione..." },
                ...moedas.map((m) => ({
                  value: m.id,
                  label: `${m.nome} (${m.codigo})`,
                })),
              ]}
            />

            <Select
              label="Moeda Destino"
              value={form.moedaDestinoId}
              onChange={(e) => handleChange("moedaDestinoId", e.target.value)}
              onBlur={() => handleBlur("moedaDestinoId")}
              error={showError("moedaDestinoId")}
              options={[
                { value: "", label: "Selecione..." },
                ...moedas.map((m) => ({
                  value: m.id,
                  label: `${m.nome} (${m.codigo})`,
                })),
              ]}
            />

            <label>
              Taxa (ex: 5.250000)
              <input
                type="text"
                value={form.valorTaxa}
                onChange={(e) => handleChange("valorTaxa", e.target.value)}
                onBlur={() => handleBlur("valorTaxa")}
                className={showError("valorTaxa") ? "field-invalid" : undefined}
              />
              {showError("valorTaxa") && (
                <span className="field-error-message">
                  {showError("valorTaxa")}
                </span>
              )}
            </label>

            <Button type="submit" disabled={submitting || hasErrors}>
              {submitting ? "Salvando..." : "Cadastrar Taxa"}
            </Button>
          </form>

          <div className="table-wrapper" style={{ marginTop: 24 }}>
            <table>
              <thead>
                <tr>
                  <th>Origem</th>
                  <th>Destino</th>
                  <th>Taxa</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {taxas.map((taxa) => (
                  <tr key={taxa.id}>
                    <td>
                      {taxa.moedaOrigem?.nome} ({taxa.moedaOrigem?.codigo})
                    </td>
                    <td>
                      {taxa.moedaDestino?.nome} ({taxa.moedaDestino?.codigo})
                    </td>
                    <td>{taxa.valorTaxa}</td>
                    <td>{new Date(taxa.dataTaxa).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default CambioPage;

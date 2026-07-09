import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { fetchWithCache } from "../services/cachedFetch";
import Button from "../components/Button";
import Select from "../components/Select";
import Spinner from "../components/Spinner";
import { useToast } from "../components/ToastProvider";
import { formatCurrencyBR, normalizeNumberString } from "../utils/number";
import { toDateInputValue } from "../utils/date";

interface Cedente {
  id: number;
  nome: string;
}

interface Moeda {
  id: number;
  nome: string;
  codigo: string;
}

interface ExtratoItem {
  id: number;
  cedenteNome: string;
  produtoNome: string;
  moedaTituloCodigo: string;
  moedaPagamentoCodigo: string;
  valorFace: string;
  valorLiquido: string | null;
  status: string;
  dataTransacao: string;
  dataLiquidacao: string | null;
}

interface ExtratoResposta {
  data: ExtratoItem[];
  total: number;
  page: number;
  pageSize: number;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;
const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "PENDENTE", label: "Pendente" },
  { value: "LIQUIDADA", label: "Liquidada" },
  { value: "CANCELADA", label: "Cancelada" },
];

function ExtratoPage() {
  const hoje = new Date();
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(hoje.getDate() - 30);

  const [filtros, setFiltros] = useState({
    dataInicio: toDateInputValue(trintaDiasAtras),
    dataFim: toDateInputValue(hoje),
    cedenteId: "",
    moedaPagamentoId: "",
    status: "",
  });
  const [dados, setDados] = useState<ExtratoItem[]>([]);
  const [cedentes, setCedentes] = useState<Cedente[]>([]);
  const [moedas, setMoedas] = useState<Moeda[]>([]);
  const [pagina, setPagina] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [liquidandoId, setLiquidandoId] = useState<number | null>(null);
  const { showError, showSuccess } = useToast();

  const totalPaginas = useMemo(
    () => Math.max(1, Math.ceil(total / tamanhoPagina)),
    [total, tamanhoPagina],
  );

  const buscar = async (paginaAlvo: number, tamanhoAlvo: number) => {
    setLoading(true);
    try {
      const params = {
        ...Object.fromEntries(
          Object.entries(filtros).filter(([_, value]) => value),
        ),
        page: paginaAlvo,
        pageSize: tamanhoAlvo,
      };
      const response = await api.get<ExtratoResposta>("/extrato", { params });
      setDados(response.data.data ?? []);
      setTotal(response.data.total ?? 0);
      setPagina(response.data.page ?? paginaAlvo);
      setTamanhoPagina(response.data.pageSize ?? tamanhoAlvo);
    } catch (error: any) {
      console.error(error);
      showError(error?.response?.data?.erro || "Erro ao buscar extrato");
      setDados([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarClick = () => buscar(1, tamanhoPagina);

  const irParaPagina = (destino: number) => {
    const alvo = Math.min(Math.max(1, destino), totalPaginas);
    if (alvo === pagina) return;
    buscar(alvo, tamanhoPagina);
  };

  const handlePageSizeChange = (novoTamanho: number) => buscar(1, novoTamanho);

  const liquidar = async (id: number) => {
    setLiquidandoId(id);
    try {
      await api.patch(`/transacoes/${id}/liquidar`);
      showSuccess(`Transação ${id} liquidada com sucesso`);
      await buscar(pagina, tamanhoPagina);
    } catch (error: any) {
      console.error(error);
      showError(error?.response?.data?.erro || "Erro ao liquidar transação");
    } finally {
      setLiquidandoId(null);
    }
  };

  useEffect(() => {
    buscar(1, DEFAULT_PAGE_SIZE);

    api
      .get<Moeda[]>("/moedas")
      .then((res) => setMoedas(res.data))
      .catch((err) => console.error(err));

    fetchWithCache("srm:cedentes", () =>
      api.get<Cedente[]>("/cedentes").then((r) => r.data),
    )
      .then(setCedentes)
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Extrato de Liquidação</h1>
      <div className="filter-row">
        <label>
          Data Início
          <input
            type="date"
            value={filtros.dataInicio}
            onChange={(e) =>
              setFiltros({ ...filtros, dataInicio: e.target.value })
            }
          />
        </label>
        <label>
          Data Fim
          <input
            type="date"
            value={filtros.dataFim}
            onChange={(e) =>
              setFiltros({ ...filtros, dataFim: e.target.value })
            }
          />
        </label>
        <Select
          label="Cedente"
          value={filtros.cedenteId}
          onChange={(e) =>
            setFiltros({ ...filtros, cedenteId: e.target.value })
          }
          options={[
            { value: "", label: "Todos" },
            ...cedentes.map((c) => ({ value: c.id, label: c.nome })),
          ]}
        />
        <Select
          label="Moeda Pagamento"
          value={filtros.moedaPagamentoId}
          onChange={(e) =>
            setFiltros({ ...filtros, moedaPagamentoId: e.target.value })
          }
          options={[
            { value: "", label: "Todos" },
            ...moedas.map((m) => ({
              value: m.id,
              label: `${m.nome} (${m.codigo})`,
            })),
          ]}
        />
        <Select
          label="Status"
          value={filtros.status}
          onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
          options={STATUS_OPTIONS}
        />
        <Button onClick={handleBuscarClick} disabled={loading}>
          Buscar
        </Button>
      </div>

      {loading && <Spinner label="Carregando extrato..." />}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cedente</th>
              <th>Produto</th>
              <th>Moeda Título</th>
              <th>Moeda Pagamento</th>
              <th>Valor Face</th>
              <th>Valor Líquido</th>
              <th>Status</th>
              <th>Data Transação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.cedenteNome}</td>
                <td>{item.produtoNome}</td>
                <td>{item.moedaTituloCodigo}</td>
                <td>{item.moedaPagamentoCodigo}</td>
                <td>
                  {formatCurrencyBR(normalizeNumberString(item.valorFace))}
                </td>
                <td>
                  {item.valorLiquido
                    ? formatCurrencyBR(normalizeNumberString(item.valorLiquido))
                    : "-"}
                </td>
                <td>{item.status}</td>
                <td>{new Date(item.dataTransacao).toLocaleString()}</td>
                <td>
                  {item.status === "PENDENTE" && (
                    <Button
                      variant="secondary"
                      onClick={() => liquidar(item.id)}
                      disabled={liquidandoId === item.id}
                    >
                      {liquidandoId === item.id ? "Liquidando..." : "Liquidar"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-row">
        <Button
          variant="secondary"
          onClick={() => irParaPagina(pagina - 1)}
          disabled={loading || pagina <= 1}
        >
          Anterior
        </Button>
        <span>
          Página {pagina} de {totalPaginas} ({total} resultado
          {total === 1 ? "" : "s"})
        </span>
        <Button
          variant="secondary"
          onClick={() => irParaPagina(pagina + 1)}
          disabled={loading || pagina >= totalPaginas}
        >
          Próxima
        </Button>
        <Select
          label="Itens por página"
          value={tamanhoPagina}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          disabled={loading}
          options={PAGE_SIZE_OPTIONS.map((opcao) => ({
            value: opcao,
            label: String(opcao),
          }))}
        />
      </div>
    </div>
  );
}

export default ExtratoPage;

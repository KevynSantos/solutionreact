import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

type FormData = {
  nome: string;
  cpf: string;
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
};

const defaultForm: FormData = {
  nome: '',
  cpf: '',
  cep: '',
  logradouro: '',
  bairro: '',
  cidade: '',
  estado: '',
};

export default function ClientFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(defaultForm);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      if (id && id !== 'new') {
        setLoading(true);
        try {
          const res = await fetch(`/api/clients/${id}`);
          if (res.ok) {
            const data: FormData = await res.json();
            setForm(data);
            setIsEdit(true);
          } else {
            console.warn('Cliente não encontrado, permanecendo em modo de cadastro.');
          }
        } catch (error) {
          console.error('Erro ao buscar cliente:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchClient();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClear = () => {
    setForm(defaultForm);
    setIsEdit(false);
    navigate('/clients/new');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = isEdit ? `/api/clients/${id}` : '/api/clients';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert(isEdit ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
        navigate('/clients');
      } else {
        alert('Erro ao salvar os dados.');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('Erro na requisição.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{isEdit ? 'Atualizar Endereço' : 'Cadastrar Endereço'}</h1>

      {loading ? (
        <p>Carregando dados...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 250px)',
              gap: '20px',
              marginBottom: '1rem',
            }}
          >
            <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} />
            <input name="cpf" placeholder="CPF" value={form.cpf} onChange={handleChange} />
            <input name="cep" placeholder="CEP" value={form.cep} onChange={handleChange} />
            <input name="logradouro" placeholder="Logradouro" value={form.logradouro} onChange={handleChange} />
            <input name="bairro" placeholder="Bairro" value={form.bairro} onChange={handleChange} />
            <input name="cidade" placeholder="Cidade" value={form.cidade} onChange={handleChange} />
            <input name="estado" placeholder="Estado (UF)" maxLength={2} value={form.estado} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={handleClear}>
              Apagar
            </button>
            <button type="submit">
              {isEdit ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

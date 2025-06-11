import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../ClientFormPage.css";
import { ToastContainer, toast } from 'react-toastify';

type FormData = {
  name: string;
  cpf: string;
  postalCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

const defaultForm: FormData = {
  name: '',
  cpf: '',
  postalCode: '',
  street: '',
  neighborhood: '',
  city: '',
  state: '',
};

export default function ClientFormPage() {

  const notify = () => toast(isEdit?"Endereço Atualizado com sucesso":"Endereço Criado com sucesso");
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
          const apiUrl = import.meta.env.VITE_API_URL;
          const res = await fetch(apiUrl + `/user/findOne?id=${id}`);
          if (res.ok) {
            const json = await res.json();
            if (json.user != null) {
              const data: FormData = json.user;
              setForm(data);
              setIsEdit(true);
            }
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

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({ ...prevForm, [name]: value }));

    // Se o campo modificado for o CEP e tiver 8 dígitos, busca no ViaCEP
    if (name === 'postalCode' && value.length === 8) {
      const onlyDigits = value.replace(/\D/g, '');
      if (onlyDigits.length <= 8) {
          try {
            const res = await fetch(`https://viacep.com.br/ws/${onlyDigits}/json/`);
            const data = await res.json();
            if (!data.erro) {
              setForm((prevForm) => ({
                ...prevForm,
                street: data.logradouro || '',
                neighborhood: data.bairro || '',
                city: data.localidade || '',
                state: data.uf || '',
              }));
            } else {
              //alert('CEP não encontrado.');
            }
          } catch (error) {
            console.error('Erro ao buscar CEP:', error);
          }
      }
    }
  };

  const backToHome = () => {
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const url = isEdit ? apiUrl + `/user/addOrUpdate?id=${id}` : apiUrl + '/user/addOrUpdate';
      const method = 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        notify();
        setTimeout(() => {
          navigate('/');
        }, 2000); // espera 2 segundos
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
            <input name="name" placeholder="Nome" value={form.name} onChange={handleChange} />
            <input name="cpf" placeholder="CPF" value={form.cpf} onChange={handleChange} />
            <input
              name="postalCode"
              placeholder="CEP"
              value={form.postalCode}
              inputMode="numeric"
              maxLength={8}
              onChange={handleChange}
            />
            <input name="street" placeholder="Logradouro" value={form.street} onChange={handleChange} />
            <input name="neighborhood" placeholder="Bairro" value={form.neighborhood} onChange={handleChange} />
            <input name="city" placeholder="Cidade" value={form.city} onChange={handleChange} />
            <input name="state" placeholder="Estado (UF)" maxLength={2} value={form.state} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={backToHome} className='btn-style'>
              Voltar
            </button>
            <button type="submit" className='btn-style'>
              {isEdit ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}
      <ToastContainer />
    </div>
  );
}

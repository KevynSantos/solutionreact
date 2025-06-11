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

// Validação CPF
function isCPFValid(cpf: string) {
  cpf = cpf.replace(/[^\d]+/g, '');

  if (cpf.length !== 11) return false;
  if (/^(.)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

// Validação se todos os campos estão preenchidos
function isFormValid(form: FormData) {
  return (
    form.name.trim() !== '' &&
    form.cpf.trim() !== '' &&
    form.postalCode.trim() !== '' &&
    form.street.trim() !== '' &&
    form.neighborhood.trim() !== '' &&
    form.city.trim() !== '' &&
    form.state.trim() !== ''
  );
}

export default function ClientFormPage() {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(defaultForm);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const notifySuccess = () =>
    toast.success(isEdit ? "Endereço Atualizado com sucesso" : "Endereço Criado com sucesso");

  const notifyError = (msg: string) =>
    toast.error(msg);

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

    // Validações antes do envio
    if (!isFormValid(form)) {
      notifyError('Por favor, preencha todos os campos.');
      return;
    }

    if (!isCPFValid(form.cpf)) {
      notifyError('CPF inválido. Por favor, insira um CPF válido.');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const url = isEdit ? apiUrl + `/user/addOrUpdate?id=${id}` : apiUrl + '/user/addOrUpdate';
      const method = 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        notifySuccess();
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        notifyError('Erro ao salvar os dados.');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      notifyError('Erro na requisição.');
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
            {/** Campos do formulário com label e input **/}
            {['name', 'cpf', 'postalCode', 'street', 'neighborhood', 'city', 'state'].map((field) => (
              <div
                key={field}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <label htmlFor={field} style={{ marginBottom: '4px', textTransform: 'capitalize' }}>
                  {field === 'postalCode' ? 'CEP' :
                   field === 'street' ? 'Logradouro' :
                   field === 'neighborhood' ? 'Bairro' :
                   field === 'state' ? 'Estado (UF)' :
                   field}
                </label>
                <input
                  id={field}
                  name={field}
                  value={(form as any)[field]}
                  onChange={handleChange}
                  maxLength={field === 'state' ? 2 : undefined}
                  inputMode={field === 'postalCode' ? 'numeric' : undefined}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={backToHome} className="btn-style">
              Voltar
            </button>
            <button type="submit" className="btn-style">
              {isEdit ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}

      <ToastContainer />
    </div>
  );
}

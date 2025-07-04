"use client";
import React, { useEffect, useState } from "react";
import "../Home.css";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';


const Home = () => {
  const [registros, setRegistros] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const notify = () => toast("Endereço excluído com sucesso");

  const navigate = useNavigate();

  const carregarRegistros = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(apiUrl+`/user/findAll`);
      const data = await response.json();
      setRegistros(data.list || []);
    } catch (error) {
      console.error("Erro ao carregar registros:", error);
    }
  };

  const goEditAddress = (id) => {
     navigate(`/clients/`+id);
  };

   const goAddAddress = () => {
      navigate(`/clients/add`);
   }


  useEffect(() => {
    carregarRegistros();
  }, [pagina, pageSize]);

  const excluirRegistro = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await fetch(apiUrl+`/user/delete?id=${id}`, {
        method: "DELETE",
      });      
      carregarRegistros(); // Recarrega após exclusão
      notify();
    } catch (error) {
      console.error("Erro ao excluir registro:", error);
    }
  };

  const formatarData = (data) =>
    new Date(data).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const startIndex = (pagina - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = registros.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Lista de Endereços</h1>
      <button className="btn-add-address btn-style" onClick={goAddAddress}>
        Adicionar Endereço
      </button>
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border border-gray-300">Nome</th>
              <th className="p-2 border border-gray-300">CPF</th>
              <th className="p-2 border border-gray-300">CEP</th>
              <th className="p-2 border border-gray-300">Logradouro</th>
              <th className="p-2 border border-gray-300">Bairro</th>
              <th className="p-2 border border-gray-300">Cidade</th>
              <th className="p-2 border border-gray-300">Estado</th>
              <th className="p-2 border border-gray-300">Criação</th>
              <th className="p-2 border border-gray-300">Atualização</th>
              <th className="p-2 border border-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center p-4 text-gray-500">
                  Nenhum endereço encontrado.
                </td>
              </tr>
            ) : (
              currentData.map((r) => (
                <tr key={r.cpf} className="odd:bg-white even:bg-gray-100">
                  <td className="p-2 border border-gray-300">{r.name}</td>
                  <td className="p-2 border border-gray-300">{r.cpf}</td>
                  <td className="p-2 border border-gray-300">{r.postalCode}</td>
                  <td className="p-2 border border-gray-300">{r.street}</td>
                  <td className="p-2 border border-gray-300">{r.neighborhood}</td>
                  <td className="p-2 border border-gray-300">{r.city}</td>
                  <td className="p-2 border border-gray-300">{r.state}</td>
                  <td className="p-2 border border-gray-300">{formatarData(r.createAt)}</td>
                  <td className="p-2 border border-gray-300">{formatarData(r.updatedAt)}</td>
                  <td className="p-2 border border-gray-300">
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded btn-style"
                      onClick={() => excluirRegistro(r.id)}
                    >
                      Excluir
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded btn-style"
                      onClick={() => goEditAddress(r.id)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Home;

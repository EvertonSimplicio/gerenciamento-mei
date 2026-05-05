
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

interface MeiReportProps {
  transactions: Transaction[];
  categories: { INCOME: string[], EXPENSE: string[] };
}

const MeiReport: React.FC<MeiReportProps> = ({ transactions, categories }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    transactions.forEach(t => years.add(new Date(t.date).getFullYear()));
    return Array.from(years).sort((a, b) => a - b);
  }, [transactions]);

  const monthsList = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const reportData = useMemo(() => {
    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const incomeByType = (categoryNames: string[], invoice: boolean) => {
      return monthTransactions
        .filter(t => 
          t.type === TransactionType.INCOME && 
          categoryNames.includes(t.category) && 
          (invoice ? t.hasInvoice === true : (t.hasInvoice === false || t.hasInvoice === undefined))
        )
        .reduce((sum, t) => sum + t.amount, 0);
    };

    // Classify all income categories
    const goodsCategories = categories.INCOME.filter(cat => 
      ['venda', 'produto', 'mercadoria', 'comércio', 'revenda', 'peça', 'item'].some(key => 
        cat.toLowerCase().includes(key)
      )
    );
    
    const servicesCategories = categories.INCOME.filter(cat => 
      ['serviço', 'consultoria', 'aula', 'treinamento', 'suporte', 'manutenção', 'mão de obra', 'projeto'].some(key => 
        cat.toLowerCase().includes(key)
      )
    );

    // Any income category that didn't match the above but isn't "Outros" can be assigned to a default or skipped
    // For MEI, almost everything is either commerce or service. 
    // If it's not clear, we put it in one by default or check if it matches the initial defaults.
    
    // Ensure default ones are included if not caught by keyword
    if (!goodsCategories.includes('Venda de Produtos')) goodsCategories.push('Venda de Produtos');
    if (!servicesCategories.includes('Prestação de Serviços')) servicesCategories.push('Prestação de Serviços');

    const revendaMercadoriasNoNF = incomeByType(goodsCategories, false);
    const revendaMercadoriasNF = incomeByType(goodsCategories, true);

    const prestacaoServicosNoNF = incomeByType(servicesCategories, false);
    const prestacaoServicosNF = incomeByType(servicesCategories, true);

    const industrializacaoNoNF = 0;
    const industrializacaoNF = 0;

    return {
      revendaMercadoriasNoNF,
      revendaMercadoriasNF,
      revendaMercadoriasTotal: revendaMercadoriasNoNF + revendaMercadoriasNF,
      industrializacaoNoNF,
      industrializacaoNF,
      industrializacaoTotal: industrializacaoNoNF + industrializacaoNF,
      prestacaoServicosNoNF,
      prestacaoServicosNF,
      prestacaoServicosTotal: prestacaoServicosNoNF + prestacaoServicosNF,
      total: revendaMercadoriasNoNF + revendaMercadoriasNF + industrializacaoNoNF + industrializacaoNF + prestacaoServicosNoNF + prestacaoServicosNF
    };
  }, [transactions, selectedMonth, selectedYear]);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const savedUser = JSON.parse(localStorage.getItem('mei_user') || '{}');

  return (
    <div className="max-w-4xl mx-auto py-4">
      <style>
        {`
          /* Força cor preta na tela */
          .print-area, .print-area * {
            color: #000000 !important;
          }
          
          @media print {
            @page {
              margin: 1cm;
              size: portrait;
            }
            body {
              background: white !important;
            }
            .print-area {
              border: 2px solid #000000 !important;
              box-shadow: none !important;
              margin: 0 !important;
              padding: 1.5cm !important;
              width: 100% !important;
            }
            .no-print {
              display: none !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color: #000000 !important;
            }
          }
        `}
      </style>
      
      <header className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">Relatório Mensal</h1>
          <p className="text-slate-500 font-bold text-sm">Gere o documento oficial de faturamento.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 text-sm font-black text-black outline-none focus:border-blue-500"
          >
            {monthsList.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 text-sm font-black text-black outline-none focus:border-blue-500"
          >
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button 
            onClick={handlePrint}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-all font-black flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <i className="fas fa-print"></i>
            <span>IMPRIMIR</span>
          </button>
        </div>
      </header>

      {/* Papel do Relatório */}
      <div className="overflow-x-auto pb-4 no-scrollbar">
        <div className="print-area bg-white border-[2px] border-black p-6 md:p-12 shadow-sm text-black font-sans mx-auto min-w-[700px] md:min-w-0">
          <div className="text-center mb-10 border-b-2 border-black pb-6">
            <h2 className="text-2xl font-black uppercase text-black leading-tight">Relatório Mensal das Receitas Brutas</h2>
          </div>

        <div className="space-y-4 mb-10">
          <div className="flex gap-4 items-end">
            <span className="font-black text-sm uppercase whitespace-nowrap">CNPJ:</span>
            <div className="border-b border-black flex-1 font-bold text-sm h-6 px-2 italic">
              {savedUser.cnpj || '00.000.000/0001-00'}
            </div>
          </div>
          <div className="flex gap-4 items-end">
            <span className="font-black text-sm uppercase whitespace-nowrap">Empreendedor Individual:</span>
            <div className="border-b border-black flex-1 font-bold text-sm h-6 px-2 italic uppercase">
              {savedUser.razaoSocial || savedUser.meiName || '____________________________________________________'}
            </div>
          </div>
          <div className="flex gap-4 items-end">
            <span className="font-black text-sm uppercase whitespace-nowrap">Período de Referência:</span>
            <div className="border-b border-black flex-1 font-bold text-sm h-6 px-2 italic uppercase">
              {monthsList[selectedMonth]} / {selectedYear}
            </div>
          </div>
        </div>

        <table className="w-full border-collapse border-2 border-black mb-10">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black p-3 text-[11px] font-black uppercase text-left w-3/4">Receita Bruta Mensal - Discriminação</th>
              <th className="border border-black p-3 text-[11px] font-black uppercase text-center">Valor (R$)</th>
            </tr>
          </thead>
          <tbody className="text-[12px]">
            <tr>
              <td className="border border-black p-2 font-black bg-slate-50">I - REVENDA DE MERCADORIAS (COMÉRCIO)</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-6">1. Revenda de mercadorias com dispensa de emissão de documento fiscal</td>
              <td className="border border-black p-2 text-right font-bold">R$ {formatCurrency(reportData.revendaMercadoriasNoNF)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-6">2. Revenda de mercadorias com emissão de documento fiscal</td>
              <td className="border border-black p-2 text-right font-bold">R$ {formatCurrency(reportData.revendaMercadoriasNF)}</td>
            </tr>
            <tr className="bg-slate-50">
              <td className="border border-black p-2 font-black text-right uppercase">3. Total das Receitas de Revenda de Mercadorias (1 + 2)</td>
              <td className="border border-black p-2 text-right font-black">R$ {formatCurrency(reportData.revendaMercadoriasTotal)}</td>
            </tr>

            <tr>
              <td className="border border-black p-2 font-black bg-slate-50">II - VENDA DE PRODUTOS INDUSTRIALIZADOS (INDÚSTRIA)</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-6">4. Venda de produtos industrializados com dispensa de emissão de documento fiscal</td>
              <td className="border border-black p-2 text-right font-bold">R$ {formatCurrency(reportData.industrializacaoNoNF)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-6">5. Venda de produtos industrializados com emissão de documento fiscal</td>
              <td className="border border-black p-2 text-right font-bold">R$ {formatCurrency(reportData.industrializacaoNF)}</td>
            </tr>
            <tr className="bg-slate-50">
              <td className="border border-black p-2 font-black text-right uppercase">6. Total das Receitas de Venda de Produtos Industrializados (4 + 5)</td>
              <td className="border border-black p-2 text-right font-black">R$ {formatCurrency(reportData.industrializacaoTotal)}</td>
            </tr>

            <tr>
              <td className="border border-black p-2 font-black bg-slate-50">III - PRESTAÇÃO DE SERVIÇOS</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-6">7. Receita com prestação de serviços com dispensa de emissão de documento fiscal</td>
              <td className="border border-black p-2 text-right font-bold">R$ {formatCurrency(reportData.prestacaoServicosNoNF)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 pl-6">8. Receita com prestação de serviços com emissão de documento fiscal</td>
              <td className="border border-black p-2 text-right font-bold">R$ {formatCurrency(reportData.prestacaoServicosNF)}</td>
            </tr>
            <tr className="bg-slate-50">
              <td className="border border-black p-2 font-black text-right uppercase">9. Total das Receitas com Prestação de Serviços (7 + 8)</td>
              <td className="border border-black p-2 text-right font-black">R$ {formatCurrency(reportData.prestacaoServicosTotal)}</td>
            </tr>

            <tr className="bg-slate-200">
              <td className="border border-black p-3 text-[13px] font-black text-right uppercase">Total Geral das Receitas Brutas no Mês (3 + 6 + 9)</td>
              <td className="border border-black p-3 text-right text-[13px] font-black">R$ {formatCurrency(reportData.total)}</td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-12 mt-16 items-end">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase">Local e Data:</span>
            <div className="border-b border-black h-8 flex items-end text-xs font-bold px-2 italic">
              __________________________, ____ de ________________ de {selectedYear}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full border-b border-black mb-1"></div>
            <span className="text-[10px] font-black uppercase text-center">Assinatura do Empresário</span>
          </div>
        </div>

        {/* Rodapé atualizado conforme a imagem do usuário */}
        <div className="mt-16 p-6 border-2 border-black bg-slate-50 text-[11px] leading-relaxed text-left space-y-2">
          <p className="font-black uppercase tracking-tight">ENCONTRAM-SE ANEXADOS A ESTE RELATÓRIO:</p>
          <div className="pl-2 space-y-1 font-medium">
            <p>- Os documentos fiscais comprobatórios das entradas de mercadorias e serviços tomados referentes ao período;</p>
            <p>- As notas fiscais relativas às operações ou prestações realizadas eventualmente emitidas.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default MeiReport;

import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRequests } from '@/contexts/RequestContext';
import { useAuth } from '@/contexts/AuthContext';
import { SERVICE_CATEGORIES } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function OrdemServico() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequestById } = useRequests();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const documentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const request = id ? getRequestById(id) : undefined;

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Solicitação não encontrada.</p>
          <Button onClick={() => navigate('/admin')}>Voltar ao Painel</Button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!documentRef.current) return;

    setIsGenerating(true);

    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`OS-${request.id.slice(0, 8)}-${request.pnrNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden bg-muted border-b py-4">
        <div className="container flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={handleDownloadPdf} disabled={isGenerating}>
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Gerando...' : 'Baixar PDF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Document */}
      <div className="container py-8 print:py-0">
        <div
          ref={documentRef}
          className="max-w-[210mm] mx-auto bg-white p-8 print:p-6 shadow-lg print:shadow-none"
          style={{ minHeight: '297mm' }}
        >
          {/* Header */}
          <div className="border-b-2 border-black pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/favicon.ico"
                  alt="Logo"
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="text-lg font-bold uppercase">Comando de Fronteira Jauru</h1>
                  <h2 className="text-base font-bold">66º Batalhão de Infantaria</h2>
                  <p className="text-xs text-gray-600">Seção de Manutenção de PNR</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">SISMAN-PNR</p>
                <p className="text-sm font-bold">O.S. Nº {request.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-gray-600">
                  {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold uppercase tracking-wider">Ordem de Serviço</h2>
            <p className="text-sm text-gray-600">Manutenção de Próprio Nacional Residencial</p>
          </div>

          {/* Priority Badge */}
          <div className="mb-6 flex justify-center">
            <div
              className={`px-6 py-2 font-bold text-sm uppercase tracking-wider ${request.isUrgent
                ? 'bg-red-600 text-white'
                : 'bg-green-700 text-white'
                }`}
            >
              Prioridade: {request.isUrgent ? 'URGENTE' : 'NORMAL'}
            </div>
          </div>

          {/* Data Fields */}
          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-black p-3">
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                  Identificação da PNR
                </p>
                <p className="font-bold text-lg">{request.pnrNumber}</p>
              </div>
              <div className="border border-black p-3">
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                  Data da Solicitação
                </p>
                <p className="font-bold">
                  {format(request.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>

            <div className="border border-black p-3">
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                Endereço Completo
              </p>
              <p className="font-semibold">{request.pnrAddress}</p>
            </div>

            <div className="border border-black p-3">
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                Tipo de Serviço
              </p>
              <p className="font-bold text-lg">{SERVICE_CATEGORIES[request.category]}</p>
            </div>

            <div className="border border-black p-3">
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                Descrição do Serviço Solicitado
              </p>
              <p className="mt-1">{request.description}</p>
            </div>
          </div>

          {/* Execution Section */}
          <div className="border border-black p-3 mb-6">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">
              Observações da Execução (a ser preenchido pelo prestador)
            </p>
            <div className="min-h-[80px] border-t border-dashed border-gray-300 mt-2"></div>
          </div>

          {/* Materials Used */}
          <div className="border border-black p-3 mb-8">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">
              Material Utilizado
            </p>
            <div className="min-h-[60px] border-t border-dashed border-gray-300 mt-2"></div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-16">
            <div className="text-center">
              <div className="border-t-2 border-black pt-2 mx-4">
                <p className="text-sm font-bold">Fiscal Administrativo</p>
                <p className="text-xs text-gray-600">Assinatura e Carimbo</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-black pt-2 mx-4">
                <p className="text-sm font-bold">Responsável pela Execução</p>
                <p className="text-xs text-gray-600">Assinatura</p>
              </div>
            </div>
          </div>

          {/* Confirmation Section */}
          <div className="mt-12 border border-black p-3">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">
              Atesto que o serviço foi executado conforme solicitado
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-600">Data de Conclusão:</p>
                <div className="border-b border-black mt-4 w-32"></div>
              </div>
              <div className="text-right">
                <div className="border-t-2 border-black pt-2 mx-8 mt-8">
                  <p className="text-xs text-gray-600">Morador - Assinatura</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
            <p>
              Documento gerado pelo SISMAN-PNR em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
            <p className="mt-1">Comando de Fronteira Jauru / 66º Batalhão de Infantaria</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}

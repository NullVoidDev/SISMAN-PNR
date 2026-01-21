import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Upload, CheckCircle, X, ImageIcon } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRequests } from '@/contexts/RequestContext';
import { supabase, DbPNR, uploadMultipleImages } from '@/lib/supabase';
import { SERVICE_CATEGORIES, ServiceCategory, PNR } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

export default function SolicitarManutencao() {
  const navigate = useNavigate();
  const { addRequest } = useRequests();
  const { toast } = useToast();

  const [pnrs, setPnrs] = useState<PNR[]>([]);
  const [isLoadingPnrs, setIsLoadingPnrs] = useState(true);
  const [step, setStep] = useState<'search' | 'form' | 'success'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPnr, setSelectedPnr] = useState<PNR | null>(null);
  const [category, setCategory] = useState<ServiceCategory | ''>('');
  const [description, setDescription] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterRank, setRequesterRank] = useState('');
  const [createdRequestId, setCreatedRequestId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  // Fetch PNRs from Supabase
  useEffect(() => {
    async function fetchPnrs() {
      try {
        const { data, error } = await supabase
          .from('pnrs')
          .select('*')
          .order('number');

        if (error) {
          console.error('Error fetching PNRs:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar as PNRs.',
            variant: 'destructive',
          });
          return;
        }

        const mapped: PNR[] = (data || []).map((pnr: DbPNR) => ({
          id: pnr.id,
          number: pnr.number,
          address: pnr.address,
          block: pnr.block,
        }));

        setPnrs(mapped);
      } catch (err) {
        console.error('Error fetching PNRs:', err);
      } finally {
        setIsLoadingPnrs(false);
      }
    }

    fetchPnrs();
  }, [toast]);

  // Aplicar debounce na busca para evitar filtros a cada tecla
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredPnrs = pnrs.filter(
    pnr =>
      pnr.number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      pnr.address.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleSelectPnr = (pnr: PNR) => {
    setSelectedPnr(pnr);
    setStep('form');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'Arquivo muito grande',
          description: `${file.name} excede o limite de 20MB.`,
          variant: 'destructive',
        });
        continue;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Tipo inválido',
          description: `${file.name} não é uma imagem válida.`,
          variant: 'destructive',
        });
        continue;
      }

      // Check max images
      if (selectedImages.length + newFiles.length >= MAX_IMAGES) {
        toast({
          title: 'Limite atingido',
          description: `Você pode adicionar no máximo ${MAX_IMAGES} imagens.`,
          variant: 'destructive',
        });
        break;
      }

      newFiles.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    }

    setSelectedImages(prev => [...prev, ...newFiles]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);

    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPnr || !category || !description.trim() || !requesterName.trim() || !requesterRank.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Upload images first
    let uploadedImageUrls: string[] = [];
    if (selectedImages.length > 0) {
      setIsUploadingImages(true);
      uploadedImageUrls = await uploadMultipleImages(selectedImages);
      setIsUploadingImages(false);

      if (uploadedImageUrls.length < selectedImages.length) {
        toast({
          title: 'Aviso',
          description: 'Algumas imagens não puderam ser enviadas.',
          variant: 'destructive',
        });
      }
    }

    const newRequest = await addRequest({
      pnrNumber: selectedPnr.number,
      pnrAddress: selectedPnr.address,
      requesterName: requesterName.trim(),
      requesterRank: requesterRank.trim(),
      category: category as ServiceCategory,
      description: description.trim(),
      isUrgent: false,
      images: uploadedImageUrls,
    });

    setIsSubmitting(false);

    if (newRequest) {
      setCreatedRequestId(newRequest.id);
      setStep('success');
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a solicitação. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-2xl">
          {/* Step: Search PNR */}
          {step === 'search' && (
            <Card className="card-military">
              <CardHeader>
                <CardTitle className="text-xl font-heading flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Localizar sua PNR
                </CardTitle>
                <CardDescription>
                  Digite o número da sua casa PNR ou endereço para iniciar a solicitação.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search">Buscar PNR</Label>
                  <Input
                    id="search"
                    placeholder="Ex: PNR-001 ou Rua das Palmeiras"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="input-military mt-1"
                  />
                </div>

                {isLoadingPnrs ? (
                  <p className="text-center text-muted-foreground py-4">
                    Carregando PNRs...
                  </p>
                ) : searchTerm.length > 0 && (
                  <div className="space-y-2">
                    {filteredPnrs.length > 0 ? (
                      filteredPnrs.map(pnr => (
                        <button
                          key={pnr.id}
                          onClick={() => handleSelectPnr(pnr)}
                          className="w-full text-left p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
                        >
                          <div className="font-semibold text-foreground">{pnr.number}</div>
                          <div className="text-sm text-muted-foreground">
                            {pnr.address} - Bloco {pnr.block}
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhuma PNR encontrada.
                      </p>
                    )}
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/')}
                >
                  Voltar
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step: Form */}
          {step === 'form' && selectedPnr && (
            <Card className="card-military">
              <CardHeader>
                <CardTitle className="text-xl font-heading">Nova Solicitação</CardTitle>
                <CardDescription>
                  Preencha os dados da solicitação de manutenção.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Selected PNR */}
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-xs text-muted-foreground">PNR Selecionada</Label>
                    <p className="font-semibold">{selectedPnr.number}</p>
                    <p className="text-sm text-muted-foreground">{selectedPnr.address}</p>
                  </div>

                  {/* Military Identification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="requesterRank">Graduação *</Label>
                      <Input
                        id="requesterRank"
                        placeholder="Ex: Sgt, Sub, Ten, Cap..."
                        value={requesterRank}
                        onChange={e => setRequesterRank(e.target.value)}
                        className="input-military"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requesterName">Nome de Guerra *</Label>
                      <Input
                        id="requesterName"
                        placeholder="Ex: Silva"
                        value={requesterName}
                        onChange={e => setRequesterName(e.target.value)}
                        className="input-military"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria do Serviço *</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as ServiceCategory)}>
                      <SelectTrigger className="input-military">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SERVICE_CATEGORIES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição do Problema *</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva detalhadamente o problema que precisa de manutenção..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="input-military min-h-[120px]"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Imagens (opcional) - máx. {MAX_IMAGES}</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />

                    {/* Image Previews */}
                    {imagePreviewUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border-2 border-border"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedImages.length < MAX_IMAGES && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                      >
                        {selectedImages.length === 0 ? (
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        ) : (
                          <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        )}
                        <p className="text-sm text-muted-foreground">
                          {selectedImages.length === 0
                            ? 'Clique para adicionar imagens do problema'
                            : `Adicionar mais imagens (${selectedImages.length}/${MAX_IMAGES})`
                          }
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG até 20MB cada
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedPnr(null);
                        setStep('search');
                      }}
                    >
                      Voltar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <Card className="card-military text-center">
              <CardContent className="py-12">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-2xl font-heading font-bold mb-2">
                  Solicitação Enviada!
                </h2>
                <p className="text-muted-foreground mb-2">
                  Seu pedido foi registrado com sucesso.
                </p>
                <p className="text-sm text-muted-foreground mb-8">
                  Número da solicitação: <strong>#{createdRequestId.slice(0, 8)}</strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => navigate(`/consultar?pnr=${selectedPnr?.number}`)}>
                    Ver Status
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Voltar ao Início
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

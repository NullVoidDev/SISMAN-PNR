import { Home, ClipboardList, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-secondary to-background py-12 md:py-20">
          <div className="container text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Sistema de Solicitação de<br />
              <span className="text-primary">Manutenção de PNR</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Gerencie os pedidos de manutenção das casas PNR de forma rápida e organizada.
            </p>
          </div>
        </section>

        {/* Access Cards */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Morador Card */}
              <Card className="card-military group hover:border-primary transition-colors">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Home className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-heading">Sou Morador</CardTitle>
                  <CardDescription>
                    Solicite manutenção para sua casa PNR ou acompanhe o status de pedidos anteriores.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/solicitar" className="block">
                    <Button className="w-full" size="lg">
                      <ClipboardList className="w-5 h-5 mr-2" />
                      Nova Solicitação
                    </Button>
                  </Link>
                  <Link to="/consultar" className="block">
                    <Button variant="outline" className="w-full" size="lg">
                      Consultar Status
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Fiscal Card */}
              <Card className="card-military group hover:border-primary transition-colors">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <UserCog className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-heading">Fiscal Administrativo</CardTitle>
                  <CardDescription>
                    Acesse o painel administrativo para gerenciar as solicitações de manutenção.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/admin/login" className="block">
                    <Button variant="secondary" className="w-full" size="lg">
                      Acessar Painel
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-8 md:py-12 bg-muted/50">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-xl font-heading font-bold mb-4 text-foreground">
                Como funciona?
              </h2>
              <div className="grid sm:grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    1
                  </div>
                  <p className="text-muted-foreground">
                    Localize sua casa PNR pelo número
                  </p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    2
                  </div>
                  <p className="text-muted-foreground">
                    Preencha o formulário de solicitação
                  </p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    3
                  </div>
                  <p className="text-muted-foreground">
                    Acompanhe o status do seu pedido
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t bg-card">
        <div className="container text-center text-sm text-muted-foreground">
          <p>SISMAN-PNR © 2026 - Sistema de Solicitação de Manutenção</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

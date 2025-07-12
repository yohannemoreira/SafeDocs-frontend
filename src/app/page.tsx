import Header from "@/components/common/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Upload, Search, Share2, Lock, Users, FileText, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
  <div>
      <Header />
      {/* Hero Section */}
      <section className="px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-slate-800 mb-6">Gerenciamento Seguro de Documentos</h1>
            <p className="text-xl text-slate-600 mb-8">
              Upload, organize e compartilhe seus documentos com segurança máxima. Processamento automático de metadados
              e controle total de acesso.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Começar Agora
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline">
                  Ver Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Funcionalidades Principais</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Upload Seguro</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Upload de documentos com criptografia e armazenamento seguro no Amazon S3
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Search className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Busca Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Encontre documentos rapidamente com filtros por tipo, data e metadados
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Share2 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Compartilhamento</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Links temporários seguros para compartilhar documentos com controle de acesso
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Lock className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>Segurança Total</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Autenticação robusta e controle granular de permissões de usuário</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-6 w-6" />
            <span className="text-xl font-bold">SafeDocs</span>
          </div>
          <p className="text-slate-400">Gerenciamento seguro de documentos com tecnologia de ponta</p>
        </div>
      </footer>
    </div>
      
  )
}
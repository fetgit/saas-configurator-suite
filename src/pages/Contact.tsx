import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useLegal } from '@/contexts/LegalContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageCircle,
  ArrowLeft,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const Contact = () => {
  const { companyInfo } = useLegal();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'envoi
    setTimeout(() => {
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
      });
      
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Breadcrumb / Navigation */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Header de la page */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">{t('nav.contact')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une question, un projet, ou besoin d'aide ? Notre équipe est là pour vous accompagner.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Formulaire de contact */}
            <div className="lg:col-span-2">
              <Card className="shadow-large border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Envoyez-nous un message
                  </CardTitle>
                  <CardDescription>
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom complet *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="John Doe"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Adresse email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="john@example.com"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Entreprise (optionnel)</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Nom de votre entreprise"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Sujet *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Objet de votre demande"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Décrivez votre demande en détail..."
                        rows={6}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Informations de contact */}
            <div className="space-y-6">
              {/* Coordonnées */}
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle>Nos coordonnées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">{companyInfo.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p className="text-muted-foreground">{companyInfo.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-muted-foreground">{companyInfo.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Horaires */}
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horaires d'ouverture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Lundi - Vendredi</span>
                    <span className="text-muted-foreground">9h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span className="text-muted-foreground">9h00 - 12h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span className="text-muted-foreground">Fermé</span>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle>Besoin d'aide ?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Réponse sous 24h en moyenne</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Support technique gratuit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Accompagnement personnalisé</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/help">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Centre d'aide
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* FAQ rapide */}
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle>Questions fréquentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-sm mb-1">Comment créer un compte ?</p>
                    <p className="text-xs text-muted-foreground">
                      Cliquez sur "S'inscrire" et suivez les étapes guidées.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">Quels sont les tarifs ?</p>
                    <p className="text-xs text-muted-foreground">
                      Consultez notre page tarifs pour voir toutes les offres.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">Support technique ?</p>
                    <p className="text-xs text-muted-foreground">
                      Notre équipe technique est disponible par email.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
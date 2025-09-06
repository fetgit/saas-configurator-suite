import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TwoFactorService } from '@/services/twoFactorService';
import { Shield, Key, Clock, AlertCircle, Smartphone } from 'lucide-react';

interface TwoFactorVerificationProps {
  userEmail: string;
  onVerificationSuccess: () => void;
  onUseBackupCode: () => void;
  onCancel: () => void;
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  userEmail,
  onVerificationSuccess,
  onUseBackupCode,
  onCancel
}) => {
  const { toast } = useToast();
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

  const MAX_ATTEMPTS = 3;
  const LOCK_DURATION = 300; // 5 minutes en secondes

  // Timer pour le code TOTP
  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(TwoFactorService.getTimeRemaining());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  // Timer pour le verrouillage
  useEffect(() => {
    if (isLocked && lockTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setLockTimeRemaining(lockTimeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLocked && lockTimeRemaining === 0) {
      setIsLocked(false);
      setAttempts(0);
    }
  }, [isLocked, lockTimeRemaining]);

  // Vérifier le code TOTP
  const handleVerifyTotp = async () => {
    if (!totpCode || totpCode.length !== 6) {
      toast({
        title: "Code invalide",
        description: "Veuillez entrer un code à 6 chiffres",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Simulation de la vérification (en production, ceci sera fait côté serveur)
      // const isValid = await verifyTwoFactorCode(userEmail, totpCode);
      
      // Pour la démo, on simule une vérification
      const isValid = totpCode === '123456'; // Code de test
      
      if (isValid) {
        toast({
          title: "Connexion réussie",
          description: "Votre code 2FA est valide !",
        });
        onVerificationSuccess();
      } else {
        handleFailedAttempt();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la vérification du code",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Vérifier le code de récupération
  const handleVerifyBackupCode = async () => {
    if (!backupCode || backupCode.length !== 8) {
      toast({
        title: "Code invalide",
        description: "Veuillez entrer un code de récupération à 8 caractères",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Simulation de la vérification du code de récupération
      // const isValid = await verifyBackupCode(userEmail, backupCode);
      
      // Pour la démo, on simule une vérification
      const isValid = backupCode === 'ABCD1234'; // Code de test
      
      if (isValid) {
        toast({
          title: "Connexion réussie",
          description: "Code de récupération valide !",
        });
        onVerificationSuccess();
      } else {
        handleFailedAttempt();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la vérification du code de récupération",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Gérer les tentatives échouées
  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= MAX_ATTEMPTS) {
      setIsLocked(true);
      setLockTimeRemaining(LOCK_DURATION);
      toast({
        title: "Compte verrouillé",
        description: `Trop de tentatives échouées. Réessayez dans ${Math.ceil(LOCK_DURATION / 60)} minutes.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Code invalide",
        description: `Code incorrect. ${MAX_ATTEMPTS - newAttempts} tentative(s) restante(s).`,
        variant: "destructive"
      });
    }
  };

  // Formater le temps de verrouillage
  const formatLockTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLocked) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Compte verrouillé
          </CardTitle>
          <CardDescription>
            Trop de tentatives de connexion échouées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Votre compte est temporairement verrouillé pour des raisons de sécurité.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <div className="text-2xl font-mono">
              {formatLockTime(lockTimeRemaining)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Temps restant avant déverrouillage
            </p>
          </div>

          <Button variant="outline" onClick={onCancel} className="w-full">
            Retour à la connexion
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Vérification 2FA
        </CardTitle>
        <CardDescription>
          Entrez votre code d'authentification pour continuer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showBackupCode ? (
          <>
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Ouvrez votre application d'authentification et entrez le code à 6 chiffres.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  Temps restant: {timeRemaining}s
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totp-code">Code d'authentification</Label>
              <Input
                id="totp-code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleVerifyTotp} 
                disabled={totpCode.length !== 6 || isVerifying}
                className="flex-1"
              >
                {isVerifying ? "Vérification..." : "Vérifier"}
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setShowBackupCode(true)}
                className="text-sm"
              >
                Utiliser un code de récupération
              </Button>
            </div>
          </>
        ) : (
          <>
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Entrez un de vos codes de récupération à 8 caractères.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="backup-code">Code de récupération</Label>
              <Input
                id="backup-code"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                placeholder="ABCD1234"
                maxLength={8}
                className="text-center text-lg tracking-widest font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleVerifyBackupCode} 
                disabled={backupCode.length !== 8 || isVerifying}
                className="flex-1"
              >
                {isVerifying ? "Vérification..." : "Vérifier"}
              </Button>
              <Button variant="outline" onClick={() => setShowBackupCode(false)}>
                Retour
              </Button>
            </div>
          </>
        )}

        {attempts > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {MAX_ATTEMPTS - attempts} tentative(s) restante(s) avant verrouillage.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

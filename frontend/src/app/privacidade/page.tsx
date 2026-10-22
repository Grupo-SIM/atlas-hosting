import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal";

export const metadata: Metadata = {
  description: "Conheça como a Atlas Hosting coleta, utiliza e protege seus dados pessoais.",
  title: "Política de Privacidade | Atlas Hosting",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      currentPage="privacidade"
      description="Saiba quais dados tratamos, por que precisamos deles e como você pode exercer seus direitos."
      title="Política de Privacidade"
    >
      <LegalSection title="1. Compromisso com sua privacidade">
        <p>
          A Atlas Hosting respeita a privacidade de clientes, visitantes e parceiros. Esta política explica como
          tratamos dados pessoais ao utilizar nosso site, plataforma e serviços de hospedagem.
        </p>
        <p>
          O tratamento de dados segue a legislação aplicável, incluindo a Lei Geral de Proteção de Dados Pessoais
          (LGPD — Lei nº 13.709/2018).
        </p>
      </LegalSection>

      <LegalSection title="2. Dados que podemos coletar">
        <p>Podemos tratar dados fornecidos por você ou gerados durante o uso dos serviços, como:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-sky-400">
          <li>nome, e-mail, telefone, CPF ou CNPJ e dados de endereço;</li>
          <li>informações de conta, autenticação e preferências de atendimento;</li>
          <li>dados necessários para cobrança, pagamento e emissão de documentos fiscais;</li>
          <li>registros técnicos, como endereço IP, logs de acesso, navegador e uso da plataforma.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Como usamos seus dados">
        <p>Utilizamos dados pessoais para fornecer, administrar e aprimorar os serviços contratados, inclusive para:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-sky-400">
          <li>criar e manter sua conta, processar pedidos e prestar suporte;</li>
          <li>prevenir fraudes, abusos, incidentes de segurança e descumprimentos contratuais;</li>
          <li>cumprir obrigações legais, regulatórias, fiscais e contábeis;</li>
          <li>enviar comunicações operacionais sobre conta, serviços, pagamentos e segurança.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Compartilhamento e armazenamento">
        <p>
          Compartilhamos dados apenas quando necessário para a operação dos serviços, com fornecedores de
          infraestrutura, meios de pagamento, registro de domínios, atendimento e autoridades competentes, quando a
          lei exigir.
        </p>
        <p>
          Mantemos dados pelo período necessário para as finalidades descritas nesta política, cumprimento de
          obrigações legais ou defesa de direitos. Adotamos medidas técnicas e organizacionais razoáveis para reduzir
          riscos de acesso não autorizado, perda ou alteração.
        </p>
      </LegalSection>

      <LegalSection title="5. Seus direitos">
        <p>
          Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação de
          dados tratados com consentimento e informações sobre compartilhamento, nos limites previstos pela LGPD.
        </p>
        <p>
          Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato pelo canal de suporte
          disponível em sua conta Atlas Hosting.
        </p>
      </LegalSection>

      <LegalSection title="6. Alterações nesta política">
        <p>
          Podemos atualizar esta política para refletir mudanças nos serviços ou na legislação. A versão vigente
          estará sempre disponível nesta página, com a data da última atualização.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

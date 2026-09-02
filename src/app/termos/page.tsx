import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal";

export const metadata: Metadata = {
  description: "Leia os termos aplicáveis ao uso da plataforma e dos serviços da Atlas Hosting.",
  title: "Termos de Serviço | Atlas Hosting",
};

export default function TermsPage() {
  return (
    <LegalPage
      currentPage="termos"
      description="Estas condições definem as regras para usar a plataforma e contratar os serviços da Atlas Hosting."
      title="Termos de Serviço"
    >
      <LegalSection title="1. Aceitação dos termos">
        <p>
          Ao criar uma conta, contratar ou utilizar os serviços da Atlas Hosting, você declara que leu e concorda com
          estes termos e com nossa Política de Privacidade.
        </p>
        <p>
          Caso você utilize os serviços em nome de uma empresa ou organização, declara possuir autorização para aceitar
          estes termos em nome dela.
        </p>
      </LegalSection>

      <LegalSection title="2. Serviços e disponibilidade">
        <p>
          A Atlas Hosting oferece serviços de hospedagem, servidores virtuais, domínios e recursos relacionados,
          conforme o plano contratado. Recursos, limites, preços e condições específicas são apresentados antes da
          contratação.
        </p>
        <p>
          Podemos realizar manutenções, atualizações e intervenções necessárias para segurança, estabilidade e melhoria
          da plataforma. Sempre que possível, avisaremos previamente sobre impactos relevantes.
        </p>
      </LegalSection>

      <LegalSection title="3. Conta e responsabilidades">
        <p>
          Você é responsável pela veracidade dos dados cadastrados, pela proteção das credenciais de acesso e pelas
          atividades realizadas em sua conta. Informe-nos imediatamente caso identifique uso não autorizado.
        </p>
        <p>
          Também é sua responsabilidade manter cópias de segurança adequadas do conteúdo hospedado, salvo quando um
          serviço de backup estiver expressamente incluído no plano contratado.
        </p>
      </LegalSection>

      <LegalSection title="4. Uso aceitável">
        <p>
          Não é permitido utilizar os serviços para atividades ilícitas, invasão de sistemas, distribuição de malware,
          envio de spam, violação de direitos de terceiros ou qualquer ação que comprometa a segurança e a estabilidade
          da infraestrutura.
        </p>
        <p>
          Podemos suspender ou limitar o acesso quando houver indícios razoáveis de uso indevido, risco à infraestrutura
          ou descumprimento destes termos, preservados os direitos previstos em lei.
        </p>
      </LegalSection>

      <LegalSection title="5. Cobrança, renovação e cancelamento">
        <p>
          Valores, ciclos de cobrança, formas de pagamento, renovação e condições de cancelamento seguem as informações
          exibidas no momento da contratação e no painel da sua conta.
        </p>
        <p>
          A falta de pagamento poderá resultar na suspensão ou encerramento do serviço, conforme as condições do plano e
          a legislação aplicável. O cancelamento não elimina valores já vencidos ou obrigações pendentes.
        </p>
      </LegalSection>

      <LegalSection title="6. Alterações e contato">
        <p>
          Estes termos podem ser atualizados para refletir mudanças nos serviços, requisitos legais ou práticas
          operacionais. A versão vigente ficará disponível nesta página, com a data da última atualização.
        </p>
        <p>
          Dúvidas sobre estes termos devem ser encaminhadas pelo canal de suporte disponível em sua conta Atlas Hosting.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

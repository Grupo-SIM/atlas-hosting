// Precisa ser `type`, não `interface`: só type alias ganha index signature
// implícita, exigida ao passar isto para `new URLSearchParams(...)`.
export type OrganizationPageParams = {
  action?: "createMember";
};

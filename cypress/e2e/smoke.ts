describe('smoke tests', () => {
  it('should allow you to visit a blog post', () => {
    cy.visit('/blog/taking-the-d-out-of-crud-with-soft-updates');

    cy.findByText("Taking the 'D' Out of CRUD with Soft Updates").should('exist');
  });
});

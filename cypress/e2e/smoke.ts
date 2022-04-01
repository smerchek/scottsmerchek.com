describe('smoke tests', () => {
  it('should allow you to visit a blog post', () => {
    cy.visit('/blog/taking-the-d-out-of-crud-with-soft-updates');

    cy.get('h1').should('contain', 'CRUD with Soft Updates');
  });
});

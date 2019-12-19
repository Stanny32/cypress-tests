/// <reference types="Cypress" />
let id;

describe("API PLayground - Products", () => {
  beforeEach(() => {
    cy.visit("localhost:3030");
  });

  context("GET-ting", () => {
    it("products", () => {
      cy.request("/products").should(response => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.length.of.at.least(1);
      });
    });

    it("a product's name", () => {
      cy.request("/products/43900").should(response => {
        expect(response.body.name).to.eq("Duracell - AAA Batteries (4-Pack)");
      });
    });

    it("non exisiting product name", () => {
      cy.request({ url: "/products/000000", failOnStatusCode: false }).should(
        response => {
          expect(response.status).to.eq(404);
        }
      );
    });
  });

  context("POST-ing", () => {
    it("a new product", () => {
      const options = {
        method: "post",
        url: "/products",
        body: {
          name: "Thingy",
          type: "thing",
          price: 10,
          shipping: 1,
          upc: "upc thing",
          description: "Thingy for different things",
          manufacturer: "Thingy ™️",
          model: "Thingy Model Z",
          url: "https://www.urbandictionary.com/define.php?term=thingy"
        }
      };

      cy.request(options).should(response => {
        expect(response.status).to.eq(201);
        id = response.body.id;
      })
      .then(() => cy.request(`products/${id}`).should(response => {
        expect(response.status).to.eq(200);
        expect(response.body.name).to.eq("Thingy");
        expect(response.body.price).to.eq(10);
        expect(response.body.model).to.eq("Thingy Model Z");
      }));
   
    });

    it("a product with invalid data type", () => {
      const options = {
        method: "post",
        url: "/products",
        body: {
          name: "Thingy2",
          type: "thing",
          price: 10,
          shipping: "12345",
          upc: "upc thing",
          description: 1234567890,
          manufacturer: "Thingy ™️",
          model: "Thingy Model Z",
          url: "https://www.urbandictionary.com/define.php?term=thingy"
        },
        failOnStatusCode: false
      };

      cy.request(options).should(response => {
        expect(response.status).to.equal(400);
        expect(response.body.errors[0]).to.equal("'shipping' should be number");
        expect(response.body.errors[1]).to.equal(
          "'description' should be string"
        );
      });
    });

    it("a product with invalid data value", () => {
      const options = {
        method: "post",
        url: "/products",
        body: {
          name: "Thingy",
          type: "thing",
          price: 10,
          shipping: 0,
          upc: "a very looooong description for ups",
          description: "It's a thingy! ",
          manufacturer: "Thingy ™️",
          model: "Thingy Model Z",
          url: "https://www.urbandictionary.com/define.php?term=thingy"
        },
        failOnStatusCode: false
      };

      cy.request(options).then(response => {
        expect(response.status).to.equal(400);
        expect(response.body.errors[0]).to.equal(
          "'upc' should NOT be longer than 15 characters"
        );
      });
    });
  });

  context("PATCH-ing", () => {
    it("a not exisiting product", () => {
      const options = {
        method: "patch",
        url: "/products/000000",
        failOnStatusCode: false
      };

      cy.request(options).then(response => {
        expect(response.status).to.equal(404);
      });
    });

    it("an exisiting product", () => {
      const options = {
        method: "patch",
        url: `products/${id}`,
        body: { name: "The New Thingy" },
        failOnStatusCode: false
      };

      cy.request(options).then(response => {
        expect(response.status).to.equal(200);
      });

      cy.request(`products/${id}`).should(response => {
        expect(response.body.name).to.eq("The New Thingy");
      });
    });

    it("an exisiting product with not valid data type", () => {
      const options = {
        method: "patch",
        url: "/products/48530",
        body: {
          shipping: "1",
          description: 0
        },
        failOnStatusCode: false
      };

      cy.request(options).should(response => {
        expect(response.status).to.equal(400);
        expect(response.body.errors[0]).to.equal("'shipping' should be number");
        expect(response.body.errors[1]).to.equal(
          "'description' should be string"
        );
      });
    });

    it("an exisiting product with not valid data value", () => {
      const options = {
        method: "patch",
        url: "products/48530",
        body: { upc: "a very very long description for this" },
        failOnStatusCode: false
      };

      cy.request(options).then(response => {
        expect(response.status).to.equal(400);
        expect(response.body.errors[0]).to.equal(
          "'upc' should NOT be longer than 15 characters"
        );
      });
    });
  });

  context("DELETE-ing", () => {
    it("an exisiting product", () => {
      cy.request({
        method: "delete",
        url: `products/${id}`,
        failOnStatusCode: false
      }).should(response => {
        expect(response.status).to.eq(200);
      });

      cy.request({
        url: `products/${id}`,
        failOnStatusCode: false
      }).should(response => {
        expect(response.status).to.eq(404);
      });
    });

    it("a not exisiting product", () => {
      cy.request({
        method: "delete",
        url: "products/000000",
        failOnStatusCode: false
      }).should(response => {
        expect(response.status).to.eq(404);
      });
    });

    //  xit'ed as this actually deletes all products
    xit("all products", () => {
      cy.visit("localhost:3030");
      cy.request({
        method: "delete",
        url: "/products",
        failOnStatusCode: false
      }).should(response => {
        expect(response.status).to.eq(403);
      });
    });
  });
});

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# import uvicorn

# app = FastAPI()

# # Enable CORS for all origins
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/")
# def root():
#     return {"message": "AI Server is running!"}

# @app.get("/health")
# def health():
#     return {"status": "healthy", "server": "running"}

# @app.get("/api/predictions")
# def predictions():
#     return {
#         "stockPredictions": [
#             {"ingredient": "Tomatoes", "currentStock": 50, "predictedDemand": 45, "daysUntilShortage": 5, "recommendation": "Reorder within 3 days"},
#             {"ingredient": "Cheese", "currentStock": 20, "predictedDemand": 30, "daysUntilShortage": 2, "recommendation": "Urgent: Reorder immediately"},
#             {"ingredient": "Onions", "currentStock": 30, "predictedDemand": 25, "daysUntilShortage": 7, "recommendation": "Reorder within 5 days"}
#         ],
#         "shortageAlerts": 1,
#         "menuPricing": [
#             {"menuItem": "Margherita Pizza", "currentPrice": 12.99, "recommendedPrice": 14.99, "reason": "Ingredient cost increased by 15%"},
#             {"menuItem": "Caesar Salad", "currentPrice": 8.99, "recommendedPrice": 9.99, "reason": "High demand"}
#         ],
#         "prepTime": "15 minutes"
#     }

# @app.get("/api/predictions/stock")
# def stock_predictions():
#     return [
#         {"ingredient": "Tomatoes", "currentStock": 50, "predictedDemand": 45, "daysUntilShortage": 5, "recommendation": "Reorder within 3 days"},
#         {"ingredient": "Cheese", "currentStock": 20, "predictedDemand": 30, "daysUntilShortage": 2, "recommendation": "Urgent: Reorder immediately"},
#         {"ingredient": "Onions", "currentStock": 30, "predictedDemand": 25, "daysUntilShortage": 7, "recommendation": "Reorder within 5 days"}
#     ]

# @app.get("/api/recommendations")
# def recommendations():
#     return {
#         "stockReorder": [
#             {"ingredient": "Tomatoes", "quantity": 20},
#             {"ingredient": "Cheese", "quantity": 30},
#             {"ingredient": "Onions", "quantity": 15}
#         ],
#         "wasteReduction": [
#             {"ingredient": "Lettuce", "reduction": 15},
#             {"ingredient": "Bread", "reduction": 10}
#         ]
#     }

# @app.get("/api/recommendations/menu-pricing")
# def menu_pricing():
#     return [
#         {"menuItem": "Margherita Pizza", "category": "Pizza", "currentPrice": 12.99, "recommendedPrice": 14.99, "reason": "Ingredient cost increased by 15%"},
#         {"menuItem": "Caesar Salad", "category": "Salads", "currentPrice": 8.99, "recommendedPrice": 9.99, "reason": "High demand"},
#         {"menuItem": "Pasta Carbonara", "category": "Pasta", "currentPrice": 15.99, "recommendedPrice": 16.99, "reason": "Ingredient cost increased"}
#     ]

# @app.post("/api/invoices/process")
# async def process_invoices():
#     return {
#         "success": True,
#         "data": [
#             {
#                 "id": "inv_1",
#                 "invoiceNumber": "INV-001",
#                 "supplier": "Supplier A",
#                 "date": "2024-01-15",
#                 "totalAmount": 150.00,
#                 "status": "processed",
#                 "items": [
#                     {"description": "Item 1", "quantity": 2, "unitPrice": 25.00, "total": 50.00},
#                     {"description": "Item 2", "quantity": 1, "unitPrice": 50.00, "total": 50.00}
#                 ]
#             }
#         ],
#         "count": 1
#     }

# @app.get("/api/invoices")
# def get_invoices():
#     return {
#         "success": True,
#         "data": [
#             {
#                 "id": "inv_1",
#                 "invoiceNumber": "INV-001",
#                 "supplier": "Supplier A",
#                 "date": "2024-01-15",
#                 "totalAmount": 150.00,
#                 "status": "processed"
#             }
#         ],
#         "count": 1
#     }

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)
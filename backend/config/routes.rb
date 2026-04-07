Rails.application.routes.draw do
  devise_for :users, controllers: { sessions: "users/sessions", registrations: "users/registrations" }

  get "up" => "rails/health#show", as: :rails_health_check

  # Serve the React SPA for all non-API routes so client-side routing works
  get "*path", to: proc { [200, { "Content-Type" => "text/html" }, [Rails.public_path.join("index.html").read]] }, constraints: ->(req) { !req.path.start_with?("/api", "/users", "/up") }

  namespace :api do
    namespace :v1 do
      resources :categories, only: [:index, :show, :create, :update, :destroy]
      resources :users, only: [:index]
      resources :life_os_modules, only: [:index, :update]

      resources :groups do
        resources :group_modules, only: [:index, :update]

        member do
          post :archive
          post :unarchive
        end

        resources :providers do
          member do
            post :archive
            post :unarchive
          end
        end

        resources :memberships, only: [:index, :create, :update, :destroy] do
          member do
            post :accept
          end
        end
      end
    end
  end
end

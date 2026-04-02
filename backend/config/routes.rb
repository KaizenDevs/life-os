Rails.application.routes.draw do
  devise_for :users, controllers: { sessions: "users/sessions", registrations: "users/registrations" }

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :categories, only: [:index, :show, :create, :update, :destroy]
      resources :users, only: [:index]

      resources :groups do
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

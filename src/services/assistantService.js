import { supabase } from '../lib/supabase';

export const assistantService = {
  /**
   * Get all active assistants
   * @returns {Promise<Array>} List of active assistants
   */
  async getAllActive() {
    try {
      const { data, error } = await supabase?.from('assistants')?.select('*')?.eq('state', 'Active')?.order('name');

      if (error) throw error;

      // Convert snake_case to camelCase for React
      return data?.map(assistant => ({
        id: assistant?.id,
        name: assistant?.name,
        description: assistant?.description,
        domain: assistant?.domain,
        knowledgeBank: assistant?.knowledge_bank,
        creditsPerMessage: assistant?.credits_per_message,
        openaiAssistantId: assistant?.openai_assistant_id,
        state: assistant?.state,
        createdAt: assistant?.created_at,
        updatedAt: assistant?.updated_at
      })) || [];
    } catch (err) {
      console.error('Error fetching assistants:', err);
      throw new Error(`Failed to fetch assistants: ${err.message}`);
    }
  },

  /**
   * Get assistant by ID
   * @param {string} assistantId - The assistant ID
   * @returns {Promise<Object|null>} Assistant data or null if not found
   */
  async getById(assistantId) {
    try {
      const { data, error } = await supabase?.from('assistants')?.select('*')?.eq('id', assistantId)?.eq('state', 'Active')?.single();

      if (error) {
        if (error?.code === 'PGRST116') {
          return null; // No rows found
        }
        throw error;
      }

      // Convert snake_case to camelCase for React
      return {
        id: data?.id,
        name: data?.name,
        description: data?.description,
        domain: data?.domain,
        knowledgeBank: data?.knowledge_bank,
        creditsPerMessage: data?.credits_per_message,
        openaiAssistantId: data?.openai_assistant_id,
        state: data?.state,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (err) {
      console.error('Error fetching assistant by ID:', err);
      throw new Error(`Failed to fetch assistant: ${err.message}`);
    }
  },

  /**
   * Get assistant by domain
   * @param {string} domain - The domain code (e.g., 'USMXXX', 'USM1XX')
   * @returns {Promise<Object|null>} Assistant data or null if not found
   */
  async getByDomain(domain) {
    try {
      const { data, error } = await supabase?.from('assistants')?.select('*')?.eq('domain', domain)?.eq('state', 'Active')?.single();

      if (error) {
        if (error?.code === 'PGRST116') {
          return null; // No rows found
        }
        throw error;
      }

      // Convert snake_case to camelCase for React
      return {
        id: data?.id,
        name: data?.name,
        description: data?.description,
        domain: data?.domain,
        knowledgeBank: data?.knowledge_bank,
        creditsPerMessage: data?.credits_per_message,
        openaiAssistantId: data?.openai_assistant_id,
        state: data?.state,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (err) {
      console.error('Error fetching assistant by domain:', err);
      throw new Error(`Failed to fetch assistant: ${err.message}`);
    }
  },

  /**
   * Search assistants by name or description
   * @param {string} query - Search query
   * @returns {Promise<Array>} List of matching assistants
   */
  async search(query) {
    try {
      const { data, error } = await supabase?.from('assistants')?.select('*')?.eq('state', 'Active')?.or(`name.ilike.%${query}%,description.ilike.%${query}%,knowledge_bank.ilike.%${query}%`)?.order('name');

      if (error) throw error;

      // Convert snake_case to camelCase for React
      return data?.map(assistant => ({
        id: assistant?.id,
        name: assistant?.name,
        description: assistant?.description,
        domain: assistant?.domain,
        knowledgeBank: assistant?.knowledge_bank,
        creditsPerMessage: assistant?.credits_per_message,
        openaiAssistantId: assistant?.openai_assistant_id,
        state: assistant?.state,
        createdAt: assistant?.created_at,
        updatedAt: assistant?.updated_at
      })) || [];
    } catch (err) {
      console.error('Error searching assistants:', err);
      throw new Error(`Failed to search assistants: ${err.message}`);
    }
  },

  /**
   * Get USMBOK assistant (default fallback)
   * @returns {Promise<Object|null>} USMBOK assistant data
   */
  async getUSMBOKAssistant() {
    try {
      const { data, error } = await supabase?.from('assistants')?.select('*')?.eq('domain', 'USMXXX')?.eq('state', 'Active')?.single();

      if (error) {
        if (error?.code === 'PGRST116') {
          // If USMBOK not found, get any active assistant as fallback
          const { data: fallbackData, error: fallbackError } = await supabase?.from('assistants')?.select('*')?.eq('state', 'Active')?.order('name')?.limit(1)?.single();

          if (fallbackError) throw fallbackError;
          
          return fallbackData ? {
            id: fallbackData?.id,
            name: fallbackData?.name,
            description: fallbackData?.description,
            domain: fallbackData?.domain,
            knowledgeBank: fallbackData?.knowledge_bank,
            creditsPerMessage: fallbackData?.credits_per_message,
            openaiAssistantId: fallbackData?.openai_assistant_id,
            state: fallbackData?.state,
            createdAt: fallbackData?.created_at,
            updatedAt: fallbackData?.updated_at
          } : null;
        }
        throw error;
      }

      // Convert snake_case to camelCase for React
      return {
        id: data?.id,
        name: data?.name,
        description: data?.description,
        domain: data?.domain,
        knowledgeBank: data?.knowledge_bank,
        creditsPerMessage: data?.credits_per_message,
        openaiAssistantId: data?.openai_assistant_id,
        state: data?.state,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (err) {
      console.error('Error fetching USMBOK assistant:', err);
      throw new Error(`Failed to fetch USMBOK assistant: ${err.message}`);
    }
  }
};

-- Fix the get_messages_for_user function to not require parameters
CREATE OR REPLACE FUNCTION get_messages_for_user()
RETURNS TABLE (
    id UUID,
    sender_id UUID,
    sender_name TEXT,
    recipient_id UUID,
    recipient_name TEXT,
    subject TEXT,
    content TEXT,
    created_at TIMESTAMPTZ,
    read BOOLEAN,
    reply_to UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.sender_id,
        sender.name AS sender_name,
        m.recipient_id,
        recipient.name AS recipient_name,
        m.subject,
        m.content,
        m.created_at,
        m.read,
        m.reply_to
    FROM messages m
    JOIN profiles sender ON m.sender_id = sender.id
    JOIN profiles recipient ON m.recipient_id = recipient.id
    WHERE m.sender_id = auth.uid() OR m.recipient_id = auth.uid()
    ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper functions to get all users of a certain role
CREATE OR REPLACE FUNCTION get_all_lenders()
RETURNS TABLE (
    id UUID,
    name TEXT,
    role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.role
    FROM profiles p
    WHERE p.role = 'lender';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_all_borrowers()
RETURNS TABLE (
    id UUID,
    name TEXT,
    role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.role
    FROM profiles p
    WHERE p.role = 'borrower';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_all_users_except(exclude_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.role
    FROM profiles p
    WHERE p.id != exclude_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a flexible function to get available contacts based on user role
CREATE OR REPLACE FUNCTION get_available_contacts(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    role TEXT
) AS $$
DECLARE
    v_user_role TEXT;
BEGIN
    -- Get the role of the current user
    SELECT role INTO v_user_role FROM profiles WHERE id = p_user_id;
    
    IF v_user_role = 'borrower' THEN
        -- Borrowers can message lenders
        RETURN QUERY SELECT * FROM get_all_lenders();
    ELSIF v_user_role = 'lender' THEN
        -- Lenders can message borrowers
        RETURN QUERY SELECT * FROM get_all_borrowers();
    ELSE
        -- Fallback to all users except current user
        RETURN QUERY SELECT * FROM get_all_users_except(p_user_id);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

package qa;

import io.swagger.petstore.data.UserData;
import io.swagger.petstore.model.User;
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class UserDataTest {
    private final UserData data = new UserData();
    private final String username = "unit-unique-user";
    private User user(String email) { return UserData.createUser(900000003L, username, "First", "Last", email, "123", 1); }
    @AfterEach void cleanup() { data.deleteUser(username); }
    @Test void addAndRead() { data.addUser(user("first@example.com")); assertEquals("first@example.com", data.findUserByName(username).getEmail()); }
    @Test void replaceSameUsername() {
        data.addUser(user("first@example.com")); data.addUser(user("second@example.com"));
        assertEquals("second@example.com", data.findUserByName(username).getEmail());
        data.deleteUser(username); assertNull(data.findUserByName(username));
    }
    @Test void deleteRemovesUser() { data.addUser(user("first@example.com")); data.deleteUser(username); assertNull(data.findUserByName(username)); }
    @Test void missingUserReturnsNull() { assertNull(data.findUserByName(username)); }
    @Test void usernameLookupIsExact() { data.addUser(user("first@example.com")); assertNull(data.findUserByName(username.toUpperCase())); }
    @Test void deleteMissingUserIsIdempotent() {
        assertDoesNotThrow(() -> { data.deleteUser(username); data.deleteUser(username); });
        assertNull(data.findUserByName(username));
    }
}

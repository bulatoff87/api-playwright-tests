package qa;

import io.swagger.petstore.data.OrderData;
import io.swagger.petstore.model.Order;
import org.junit.jupiter.api.*;
import java.util.Date;
import static org.junit.jupiter.api.Assertions.*;

class OrderDataTest {
    private final OrderData data = new OrderData();
    private final long id = 900000002L;
    private Order order(int quantity) { return OrderData.createOrder(id, 123L, quantity, new Date(0), "unit-status", false); }
    @AfterEach void cleanup() { data.deleteOrderById(id); data.deleteOrderById(id + 1); }
    @Test void addAndRead() { data.addOrder(order(3)); assertEquals(3, data.getOrderById(id).getQuantity()); }
    @Test void replaceSameId() {
        data.addOrder(order(3)); data.addOrder(order(7));
        assertEquals(7, data.getOrderById(id).getQuantity());
        assertEquals(7, data.getCountByStatus().get("unit-status"));
    }
    @Test void inventorySumsQuantities() {
        data.addOrder(order(3)); Order second = order(4); second.setId(id + 1); data.addOrder(second);
        assertEquals(7, data.getCountByStatus().get("unit-status"));
    }
    @Test void deleteRemovesOrderAndInventoryEntry() {
        data.addOrder(order(3)); data.deleteOrderById(id);
        assertNull(data.getOrderById(id)); assertFalse(data.getCountByStatus().containsKey("unit-status"));
    }
    @Test void missingOrderReturnsNull() { assertNull(data.getOrderById(id)); }
    @Test void deleteMissingOrderIsIdempotent() {
        assertDoesNotThrow(() -> { data.deleteOrderById(id); data.deleteOrderById(id); });
        assertNull(data.getOrderById(id));
    }
}
